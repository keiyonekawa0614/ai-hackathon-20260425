import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

const GOOGLE_CUSTOM_SEARCH_API_KEY = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY
const GOOGLE_CUSTOM_SEARCH_ENGINE_ID = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID

const geminiModel = google('gemini-2.0-flash')

// Google Custom Search API を使用して検索
async function searchGoogle(query: string): Promise<{ title: string; snippet: string; link: string }[]> {
  if (!GOOGLE_CUSTOM_SEARCH_API_KEY || !GOOGLE_CUSTOM_SEARCH_ENGINE_ID) {
    console.error('Google Custom Search API credentials not configured')
    return []
  }

  try {
    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.set('key', GOOGLE_CUSTOM_SEARCH_API_KEY)
    url.searchParams.set('cx', GOOGLE_CUSTOM_SEARCH_ENGINE_ID)
    url.searchParams.set('q', query)
    url.searchParams.set('num', '5')

    const response = await fetch(url.toString())
    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[v0] Google Search API error:', response.status, errorBody)
      return []
    }

    const data = await response.json()
    return (data.items || []).map((item: { title: string; snippet: string; link: string }) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
    }))
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

export async function POST(req: Request) {
  try {
    const { videoInfo } = await req.json()

    if (!videoInfo) {
      return Response.json({ error: 'Video info is required' }, { status: 400 })
    }

    const { title, description, channelTitle, tags } = videoInfo

    // 3-1. ファクトチェッククエリ生成（Gemini）
    const factCheckQueryResult = await generateText({
      model: geminiModel,
      prompt: `以下のYouTube動画のタイトルと説明文から、検証すべき主張や事実を抽出し、ファクトチェック用の検索クエリを3つ生成してください。
クエリは日本語で、簡潔で検索に適した形式にしてください。

タイトル: ${title}
説明文: ${description?.slice(0, 500) || 'なし'}
タグ: ${tags?.join(', ') || 'なし'}

JSON形式で出力してください:
{ "queries": ["クエリ1", "クエリ2", "クエリ3"] }`,
      maxOutputTokens: 500,
    })

    // 3-2. チャンネル評判クエリ生成
    const reputationQueries = [
      `${channelTitle} 評判`,
      `${channelTitle} 炎上`,
      `${channelTitle} 信頼性`,
    ]

    // クエリをパース
    let factCheckQueries: string[] = []
    try {
      const parsed = JSON.parse(factCheckQueryResult.text.replace(/```json\n?|\n?```/g, ''))
      factCheckQueries = parsed.queries || []
    } catch {
      factCheckQueries = [`${title} 事実確認`, `${title} 検証`]
    }

    // 3-3. 検索実行（並列）
    const [factCheckResults, reputationResults] = await Promise.all([
      // ファクトチェック検索
      Promise.all(factCheckQueries.slice(0, 3).map(query => searchGoogle(query))),
      // チャンネル評判検索
      Promise.all(reputationQueries.map(query => searchGoogle(query))),
    ])

    const flatFactCheckResults = factCheckResults.flat()
    const flatReputationResults = reputationResults.flat()

    // 3-4. ファクトチェック分析（Gemini）
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
      prompt: `以下のYouTube動画の内容と検索結果を分析し、ファクトチェックレポートを作成してください。

【動画情報】
タイトル: ${title}
説明文: ${description?.slice(0, 500) || 'なし'}

【検索結果】
${flatFactCheckResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n') || '検索結果なし'}

動画の主張が事実に基づいているか、誇張や誤情報がないかを評価してください。`,
      maxOutputTokens: 1000,
    })

    // 3-5. チャンネル評判分析（Gemini）
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
      prompt: `以下のYouTubeチャンネルの評判を検索結果から分析し、信頼性レポートを作成してください。

【チャンネル情報】
チャンネル名: ${channelTitle}

【検索結果】
${flatReputationResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n') || '検索結果なし'}

チャンネルの評判、過去の炎上歴、視聴者からの信頼度を評価してください。
検索結果が少ない場合は、情報不足として中立的な評価をしてください。`,
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
        searchQueries: factCheckQueries,
        searchResults: flatFactCheckResults.slice(0, 5),
      },
      reputation: {
        ...reputation,
        searchQueries: reputationQueries,
        searchResults: flatReputationResults.slice(0, 5),
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
