import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

const geminiModel = google('gemini-2.0-flash')

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
      output: Output.object({
        schema: z.object({
          accuracy: z.number().min(0).max(100).describe('情報の正確性スコア（0-100）'),
          evidenceQuality: z.number().min(0).max(100).describe('根拠の明示度スコア（0-100）'),
          summary: z.string().describe('ファクトチェック結果の要約（100-200字）'),
          concerns: z.array(z.string()).describe('懸念点のリスト'),
          verifiedClaims: z.array(z.string()).describe('確認できた主張のリスト'),
        }),
      }),
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

客観的に評価し、スコアを付けてください。`,
      maxOutputTokens: 1000,
    })

    // 3-5. チャンネル評判分析（Gemini）- 動画情報から推測
    const reputationAnalysis = await generateText({
      model: geminiModel,
      output: Output.object({
        schema: z.object({
          trustworthiness: z.number().min(0).max(100).describe('信頼性スコア（0-100）'),
          transparency: z.number().min(0).max(100).describe('透明性スコア（0-100）'),
          socialValue: z.number().min(0).max(100).describe('社会的価値スコア（0-100）'),
          summary: z.string().describe('チャンネル評判の要約（100-200字）'),
          positivePoints: z.array(z.string()).describe('良い点のリスト'),
          negativePoints: z.array(z.string()).describe('懸念点のリスト'),
        }),
      }),
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

情報が限られているため、動画の内容から推測できる範囲で評価してください。`,
      maxOutputTokens: 1000,
    })

    // 結果を統合
    const factCheck = factCheckAnalysis.output || {
      accuracy: 50,
      evidenceQuality: 50,
      summary: '分析に失敗しました',
      concerns: [],
      verifiedClaims: [],
    }

    const reputation = reputationAnalysis.output || {
      trustworthiness: 50,
      transparency: 50,
      socialValue: 50,
      summary: '分析に失敗しました',
      positivePoints: [],
      negativePoints: [],
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
