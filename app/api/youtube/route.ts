import { NextRequest, NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

// URLからVideo IDを抽出
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URLが必要です' }, { status: 400 })
    }

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YouTube APIキーが設定されていません' }, { status: 500 })
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: '有効なYouTube URLではありません' }, { status: 400 })
    }

    // 動画情報を取得
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    )
    const videoData = await videoResponse.json()

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: '動画が見つかりません' }, { status: 404 })
    }

    const video = videoData.items[0]
    const channelId = video.snippet.channelId

    // チャンネル情報を取得（登録者数）
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
    )
    const channelData = await channelResponse.json()
    const channel = channelData.items?.[0]

    // コメントを取得（上位10件）
    let comments: Array<{
      author: string
      text: string
      likeCount: number
      publishedAt: string
    }> = []
    
    try {
      const commentsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&order=relevance&key=${YOUTUBE_API_KEY}`
      )
      const commentsData = await commentsResponse.json()
      
      if (commentsData.items) {
        comments = commentsData.items.map((item: any) => ({
          author: item.snippet.topLevelComment.snippet.authorDisplayName,
          text: item.snippet.topLevelComment.snippet.textDisplay,
          likeCount: item.snippet.topLevelComment.snippet.likeCount,
          publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
        }))
      }
    } catch (e) {
      // コメントが無効の場合はスキップ
      console.log('コメント取得エラー:', e)
    }

    const result = {
      videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      tags: video.snippet.tags || [],
      publishedAt: video.snippet.publishedAt,
      thumbnails: video.snippet.thumbnails,
      channelName: video.snippet.channelTitle,
      channelId,
      subscriberCount: channel?.statistics?.subscriberCount || '非公開',
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount || '非公開',
      commentCount: video.statistics.commentCount || '0',
      comments,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('YouTube API Error:', error)
    return NextResponse.json({ error: 'APIエラーが発生しました' }, { status: 500 })
  }
}
