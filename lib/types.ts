export interface YouTubeVideoInfo {
  videoId: string
  title: string
  description: string
  tags: string[]
  publishedAt: string
  thumbnails: {
    default?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    high?: { url: string; width: number; height: number }
    standard?: { url: string; width: number; height: number }
    maxres?: { url: string; width: number; height: number }
  }
  channelName: string
  channelId: string
  subscriberCount: string
  viewCount: string
  likeCount: string
  commentCount: string
  comments: YouTubeComment[]
}

export interface YouTubeComment {
  author: string
  text: string
  likeCount: number
  publishedAt: string
}

export interface SearchResult {
  title: string
  snippet: string
  link: string
}

export interface FactCheckResult {
  accuracy: number
  evidenceQuality: number
  summary: string
  concerns: string[]
  verifiedClaims: string[]
  searchQueries: string[]
  searchResults: SearchResult[]
}

export interface ReputationResult {
  trustworthiness: number
  transparency: number
  socialValue: number
  summary: string
  positivePoints: string[]
  negativePoints: string[]
  searchQueries: string[]
  searchResults: SearchResult[]
}

export interface AnalysisResult {
  overallScore: number
  factCheck: FactCheckResult
  reputation: ReputationResult
  scores: {
    accuracy: number
    evidenceQuality: number
    trustworthiness: number
    transparency: number
    socialValue: number
  }
}
