import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

const geminiModel = google('gemini-2.0-flash')

function parseJsonFromText(text: string): Record<string, unknown> | null {
  try {
    // JSONブロックを抽出
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0]
      return JSON.parse(jsonStr)
    }
    return null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { videoInfo } = await req.json()

    if (!videoInfo) {
      return Response.json({ error: 'Video info is required' }, { status: 400 })
    }

    const { title, description, channelTitle, tags } = videoInfo

    // 3-4. ファクトチェック分析（Gemini）- 検索なしで動画情報のみから分析
    const factCheckAnalysis = await generateText({
      model: geminiModel,
      prompt: `以下のYouTube動画の内容を分析し、ファクトチェックレポートを作成してください。

【動画情報】
タイトル: ${title}
説明文: ${description?.slice(0, 1000) || 'なし'}
タグ: ${tags?.join(', ') || 'なし'}

動画のタイトルや説明文から以下を評価してください：
- 誇張表現や煽り文句がないか
- 根拠のない主張がないか
- 誤解を招く表現がないか
- 情報源が明示されているか

以下のJSON形式で回答してください（必ずこの形式で出力）：
\`\`\`json
{
  "accuracy": 0-100の数値,
  "evidenceQuality": 0-100の数値,
  "summary": "ファクトチェック結果の要約（100-200字）",
  "concerns": ["懸念点1", "懸念点2"],
  "verifiedClaims": ["確認できた主張1", "確認できた主張2"]
}
\`\`\``,
      maxOutputTokens: 1000,
    })

    // 3-5. チャンネル評判分析（Gemini）- 動画情報から推測
    const reputationAnalysis = await generateText({
      model: geminiModel,
      prompt: `以下のYouTube動画の情報から、チャンネルの信頼性を分析してください。

【チャンネル情報】
チャンネル名: ${channelTitle}

【動画情報】
タイトル: ${title}
説明文: ${description?.slice(0, 1000) || 'なし'}

以下の観点から評価してください：
- タイトルの誠実さ（クリックベイトかどうか）
- 説明文の充実度
- 視聴者への配慮
- コンテンツの社会的価値

以下のJSON形式で回答してください（必ずこの形式で出力）：
\`\`\`json
{
  "trustworthiness": 0-100の数値,
  "transparency": 0-100の数値,
  "socialValue": 0-100の数値,
  "summary": "チャンネル評判の要約（100-200字）",
  "positivePoints": ["良い点1", "良い点2"],
  "negativePoints": ["懸念点1", "懸念点2"]
}
\`\`\``,
      maxOutputTokens: 1000,
    })

    // 結果をパース
    const factCheckParsed = parseJsonFromText(factCheckAnalysis.text)
    const reputationParsed = parseJsonFromText(reputationAnalysis.text)

    const factCheck = {
      accuracy: Number(factCheckParsed?.accuracy) || 50,
      evidenceQuality: Number(factCheckParsed?.evidenceQuality) || 50,
      summary: String(factCheckParsed?.summary || '分析に失敗しました'),
      concerns: Array.isArray(factCheckParsed?.concerns) ? factCheckParsed.concerns as string[] : [],
      verifiedClaims: Array.isArray(factCheckParsed?.verifiedClaims) ? factCheckParsed.verifiedClaims as string[] : [],
    }

    const reputation = {
      trustworthiness: Number(reputationParsed?.trustworthiness) || 50,
      transparency: Number(reputationParsed?.transparency) || 50,
      socialValue: Number(reputationParsed?.socialValue) || 50,
      summary: String(reputationParsed?.summary || '分析に失敗しました'),
      positivePoints: Array.isArray(reputationParsed?.positivePoints) ? reputationParsed.positivePoints as string[] : [],
      negativePoints: Array.isArray(reputationParsed?.negativePoints) ? reputationParsed.negativePoints as string[] : [],
    }

    // 総合スコアを計算
    const overallScore = Math.round(
      (factCheck.accuracy * 0.3 +
        factCheck.evidenceQuality * 0.2 +
        reputation.trustworthiness * 0.25 +
        reputation.transparency * 0.15 +
        reputation.socialValue * 0.1)
    )

    return Response.json({
      overallScore,
      factCheck: {
        ...factCheck,
        searchQueries: [],
        searchResults: [],
      },
      reputation: {
        ...reputation,
        searchQueries: [],
        searchResults: [],
      },
      scores: {
        accuracy: factCheck.accuracy,
        evidenceQuality: factCheck.evidenceQuality,
        trustworthiness: reputation.trustworthiness,
        transparency: reputation.transparency,
        socialValue: reputation.socialValue,
      },
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return Response.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
