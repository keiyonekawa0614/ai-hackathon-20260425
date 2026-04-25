"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import {
  Play,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  Users,
  Tag,
  AlertCircle,
  ExternalLink,
  Shield,
} from "lucide-react"
import { YouTubeVideoInfo, AnalysisResult } from "@/lib/types"

type AppState = "initial" | "loading-video" | "loading-analysis" | "result" | "error"

function formatNumber(num: string): string {
  const n = parseInt(num, 10)
  if (isNaN(n)) return num
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}千`
  return num
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function CircularProgress({ score, animate }: { score: number; animate: boolean }) {
  const [displayScore, setDisplayScore] = useState(0)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (displayScore / 100) * circumference

  useEffect(() => {
    if (animate) {
      const duration = 1500
      const startTime = Date.now()
      const animateScore = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setDisplayScore(Math.round(score * easeOut))
        if (progress < 1) {
          requestAnimationFrame(animateScore)
        }
      }
      requestAnimationFrame(animateScore)
    }
  }, [animate, score])

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "善い情報"
    if (s >= 60) return "やや善い"
    if (s >= 40) return "要注意"
    return "信頼性低"
  }

  const getScoreColor = (s: number) => {
    if (s >= 60) return "text-emerald-400"
    if (s >= 40) return "text-amber-400"
    return "text-red-400"
  }

  const getStrokeColor = (s: number) => {
    if (s >= 60) return "#34d399"
    if (s >= 40) return "#fbbf24"
    return "#f87171"
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted/30"
          />
          <circle
            cx="88"
            cy="88"
            r="45"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              stroke: getStrokeColor(displayScore),
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-light ${getScoreColor(displayScore)}`}>
            {displayScore}
          </span>
          <span className="text-sm text-muted-foreground mt-1">/ 100</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {displayScore >= 60 ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
        <p className={`text-lg font-medium ${getScoreColor(displayScore)}`}>
          {getScoreLabel(displayScore)}
        </p>
      </div>
    </div>
  )
}

function HeroSection({
  url,
  setUrl,
  onAnalyze,
  isLoading,
}: {
  url: string
  setUrl: (url: string) => void
  onAnalyze: () => void
  isLoading: boolean
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="text-center max-w-2xl mx-auto space-y-10 animate-in fade-in duration-1000">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-extralight tracking-tight text-foreground">
            ZEN
          </h1>
          <p className="text-xl md:text-2xl font-light text-muted-foreground">
            最短で、より善い情報を。
          </p>
        </div>

        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
          YouTubeの動画URLを入力するだけで、
          <br className="hidden md:block" />
          AIがその動画の「善さ」を分析します。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-4">
          <Input
            type="url"
            placeholder="YouTubeのURLを入力..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && url && onAnalyze()}
            className="flex-1 h-14 px-6 text-base bg-card border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/50"
          />
          <Button
            onClick={onAnalyze}
            disabled={!url || isLoading}
            className="h-14 px-8 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300 disabled:opacity-40"
          >
            <Search className="w-5 h-5 mr-2" />
            分析する
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/60 pt-4">
          YouTubeの動画URLを入力して分析を開始してください
        </p>
      </div>
    </div>
  )
}

function LoadingSection({ stage }: { stage: "video" | "analysis" }) {
  const messages = {
    video: {
      title: "動画情報を取得中...",
      subtitle: "YouTube APIから情報を取得しています",
    },
    analysis: {
      title: "AIが動画を分析中...",
      subtitle: "ファクトチェックと評判調査を実行しています",
    },
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="text-center space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
        </div>
        <div className="space-y-3">
          <p className="text-xl font-light text-foreground">
            {messages[stage].title}
          </p>
          <p className="text-sm text-muted-foreground">
            {messages[stage].subtitle}
          </p>
        </div>
        {stage === "analysis" && (
          <div className="max-w-md mx-auto space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>ファクトチェッククエリを生成</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>チャンネル評判を調査</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>信頼性レポートを生成</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorSection({ 
  message, 
  onReset 
}: { 
  message: string
  onReset: () => void 
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="text-center space-y-8 animate-in fade-in duration-500">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
        <div className="space-y-3">
          <p className="text-xl font-light text-foreground">
            エラーが発生しました
          </p>
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        </div>
        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-xl"
        >
          戻る
        </Button>
      </div>
    </div>
  )
}

function ResultSection({ 
  onReset, 
  videoInfo,
  analysis,
}: { 
  onReset: () => void
  videoInfo: YouTubeVideoInfo
  analysis: AnalysisResult
}) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const radarData = [
    { axis: "情報の正確性", value: analysis.scores.accuracy },
    { axis: "根拠の明示", value: analysis.scores.evidenceQuality },
    { axis: "信頼性", value: analysis.scores.trustworthiness },
    { axis: "透明性", value: analysis.scores.transparency },
    { axis: "社会的価値", value: analysis.scores.socialValue },
  ]

  const getRadarColor = (score: number) => {
    if (score >= 60) return "#34d399"
    if (score >= 40) return "#fbbf24"
    return "#f87171"
  }

  const thumbnail = videoInfo.thumbnails.maxres?.url || 
                    videoInfo.thumbnails.high?.url || 
                    videoInfo.thumbnails.medium?.url ||
                    videoInfo.thumbnails.default?.url

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 md:py-20 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-foreground">
            分析結果
          </h2>
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            別の動画を分析する
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 動画情報カード */}
          <Card className="bg-card border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video relative">
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-foreground leading-relaxed line-clamp-2">
                  {videoInfo.title}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {videoInfo.channelName}
                  </p>
                  <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs bg-secondary/50">
                    <Users className="w-3 h-3 mr-1" />
                    {formatNumber(videoInfo.subscriberCount)}人
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-secondary/50">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(videoInfo.publishedAt)}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-secondary/50">
                    <Play className="w-3 h-3 mr-1" />
                    {formatNumber(videoInfo.viewCount)}回
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-secondary/50">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {formatNumber(videoInfo.likeCount)}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-secondary/50">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {formatNumber(videoInfo.commentCount)}件
                  </Badge>
                </div>
                {videoInfo.tags && videoInfo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    {videoInfo.tags.slice(0, 5).map((tag, i) => (
                      <Badge key={i} variant="outline" className="rounded-full px-2 py-0.5 text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {videoInfo.tags.length > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{videoInfo.tags.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 善さスコア */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground">
                善さスコア
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <CircularProgress score={analysis.overallScore} animate={animate} />
            </CardContent>
          </Card>

          {/* 5軸分析 */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground">
                5軸分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                    />
                    <Radar
                      name="善さ"
                      dataKey="value"
                      stroke={getRadarColor(analysis.overallScore)}
                      fill={getRadarColor(analysis.overallScore)}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* チャンネル評判 */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                チャンネル評判
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.reputation.summary}
              </p>
              {analysis.reputation.positivePoints.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-emerald-400 mb-2">良い点:</p>
                  <ul className="space-y-1">
                    {analysis.reputation.positivePoints.map((point, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.reputation.negativePoints.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-400 mb-2">懸念点:</p>
                  <ul className="space-y-1">
                    {analysis.reputation.negativePoints.map((point, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <XCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AIコメント */}
          <Card className="bg-card border-border/50 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI総合評価
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">スコア詳細</h4>
                  <div className="space-y-3">
                    {[
                      { label: "情報の正確性", value: analysis.scores.accuracy },
                      { label: "根拠の明示", value: analysis.scores.evidenceQuality },
                      { label: "信頼性", value: analysis.scores.trustworthiness },
                      { label: "透明性", value: analysis.scores.transparency },
                      { label: "社会的価値", value: analysis.scores.socialValue },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-24">{item.label}</span>
                        <div className="flex-1 bg-secondary/30 rounded-full h-2">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${item.value}%`,
                              backgroundColor: getRadarColor(item.value),
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground w-8">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">調査に使用したクエリ</h4>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">ファクトチェック:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.factCheck.searchQueries.map((q, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {q}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">評判調査:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.reputation.searchQueries.map((q, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {q}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 検索結果参照 */}
          {(analysis.factCheck.searchResults.length > 0 || analysis.reputation.searchResults.length > 0) && (
            <Card className="bg-card border-border/50 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-foreground">
                  参照した情報源
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {[...analysis.factCheck.searchResults, ...analysis.reputation.searchResults]
                      .slice(0, 8)
                      .map((result, i) => (
                        <a
                          key={i}
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <ExternalLink className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground line-clamp-1">
                                {result.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {result.snippet}
                              </p>
                            </div>
                          </div>
                        </a>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* 説明欄 */}
          <Card className="bg-card border-border/50 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground">
                動画の説明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {videoInfo.description || "説明がありません"}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* コメント */}
          {videoInfo.comments && videoInfo.comments.length > 0 && (
            <Card className="bg-card border-border/50 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-foreground">
                  上位コメント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {videoInfo.comments.map((comment, i) => (
                      <div key={i} className="border-b border-border/30 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-foreground">
                            {comment.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.publishedAt)}
                          </span>
                          {comment.likeCount > 0 && (
                            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs bg-secondary/50">
                              <ThumbsUp className="w-2.5 h-2.5 mr-1" />
                              {comment.likeCount}
                            </Badge>
                          )}
                        </div>
                        <p 
                          className="text-sm text-muted-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: comment.text }}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ZenAnalyzer() {
  const [state, setState] = useState<AppState>("initial")
  const [url, setUrl] = useState("")
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleAnalyze = async () => {
    setState("loading-video")
    setErrorMessage("")

    try {
      // Step 1: YouTube APIで動画情報を取得
      const videoResponse = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const videoData = await videoResponse.json()

      if (!videoResponse.ok) {
        throw new Error(videoData.error || "動画情報の取得に失敗しました")
      }

      setVideoInfo(videoData)
      setState("loading-analysis")

      // Step 2: AI分析を実行
      const analysisResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoInfo: videoData }),
      })

      const analysisData = await analysisResponse.json()

      if (!analysisResponse.ok) {
        throw new Error(analysisData.error || "分析に失敗しました")
      }

      setAnalysis(analysisData)
      setState("result")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "エラーが発生しました")
      setState("error")
    }
  }

  const handleReset = () => {
    setState("initial")
    setUrl("")
    setVideoInfo(null)
    setAnalysis(null)
    setErrorMessage("")
  }

  return (
    <main className="min-h-screen bg-background">
      {state === "initial" && (
        <HeroSection 
          url={url} 
          setUrl={setUrl} 
          onAnalyze={handleAnalyze}
          isLoading={false}
        />
      )}
      {state === "loading-video" && <LoadingSection stage="video" />}
      {state === "loading-analysis" && <LoadingSection stage="analysis" />}
      {state === "error" && <ErrorSection message={errorMessage} onReset={handleReset} />}
      {state === "result" && videoInfo && analysis && (
        <ResultSection 
          onReset={handleReset} 
          videoInfo={videoInfo}
          analysis={analysis}
        />
      )}
    </main>
  )
}
