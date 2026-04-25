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
} from "lucide-react"
import { YouTubeVideoInfo } from "@/lib/types"

type AppState = "initial" | "loading" | "result" | "error"

// 「より善い情報」チャンネルの場合の評価データ
const goodChannelAnalysis = {
  radarData: [
    { axis: "情報の正確性", value: 95 },
    { axis: "根拠の明示", value: 92 },
    { axis: "誠実な表現", value: 88 },
    { axis: "視聴者への配慮", value: 90 },
    { axis: "社会的価値", value: 85 },
  ],
  score: 90,
  aiComment: `このチャンネルは情報の正確性と根拠の明示において非常に高い水準を保っています。タイトルと内容の一致度も高く、視聴者を誤解させるような表現は見られません。信頼できる情報源として推奨できます。`,
}

// 一般的なチャンネルの場合の評価データ
const normalChannelAnalysis = {
  radarData: [
    { axis: "情報の正確性", value: 45 },
    { axis: "根拠の明示", value: 38 },
    { axis: "誠実な表現", value: 42 },
    { axis: "視聴者への配慮", value: 50 },
    { axis: "社会的価値", value: 35 },
  ],
  score: 42,
  aiComment: `この動画は一般的なエンターテイメントコンテンツです。情報の正確性や根拠の明示について改善の余地があります。視聴の際は他の情報源も参考にすることをお勧めします。`,
}

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

function LoadingSection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="text-center space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
        </div>
        <div className="space-y-3">
          <p className="text-xl font-light text-foreground">
            動画情報を取得中...
          </p>
          <p className="text-sm text-muted-foreground">
            しばらくお待ちください
          </p>
        </div>
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
  isGoodChannel,
}: { 
  onReset: () => void
  videoInfo: YouTubeVideoInfo
  isGoodChannel: boolean
}) {
  const [animate, setAnimate] = useState(false)
  const analysis = isGoodChannel ? goodChannelAnalysis : normalChannelAnalysis

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

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
              <CircularProgress score={analysis.score} animate={animate} />
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
                  <RadarChart data={analysis.radarData} cx="50%" cy="50%" outerRadius="70%">
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
                      stroke={getRadarColor(analysis.score)}
                      fill={getRadarColor(analysis.score)}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AIコメント */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AIコメント
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                {analysis.aiComment}
              </p>
            </CardContent>
          </Card>

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
  const [errorMessage, setErrorMessage] = useState("")
  const [isGoodChannel, setIsGoodChannel] = useState(false)

  const handleAnalyze = async () => {
    setState("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "エラーが発生しました")
      }

      setVideoInfo(data)
      
      // チャンネル名で「善さ」を判定（デモ用）
      const channelName = data.channelName.toLowerCase()
      const isGood = channelName.includes("より善い情報") || 
                     channelName.includes("yori-yoi") ||
                     channelName.includes("good-info")
      setIsGoodChannel(isGood)
      
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
    setErrorMessage("")
    setIsGoodChannel(false)
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
      {state === "loading" && <LoadingSection />}
      {state === "error" && <ErrorSection message={errorMessage} onReset={handleReset} />}
      {state === "result" && videoInfo && (
        <ResultSection 
          onReset={handleReset} 
          videoInfo={videoInfo}
          isGoodChannel={isGoodChannel}
        />
      )}
    </main>
  )
}
