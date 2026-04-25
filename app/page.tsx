"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
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
} from "lucide-react"

type AppState = "initial" | "loading" | "result"

// 「より善い情報」チャンネルの動画はスコアが高い
const goodChannelData = {
  radarData: [
    { axis: "情報の正確性", value: 95 },
    { axis: "根拠の明示", value: 92 },
    { axis: "誠実な表現", value: 88 },
    { axis: "視聴者への配慮", value: 90 },
    { axis: "社会的価値", value: 85 },
  ],
  videoData: {
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=360&fit=crop",
    title: "【徹底解説】初心者が知るべき投資の基本｜根拠とデータで学ぶ",
    channel: "より善い情報",
    publishedAt: "2024年3月10日",
    views: "45万回",
    likes: "2.8万",
    comments: "890件",
  },
  score: 90,
  aiComment: `このチャンネルは情報の正確性と根拠の明示において非常に高い水準を保っています。タイトルと内容の一致度も高く、視聴者を誤解させるような表現は見られません。信頼できる情報源として推奨できます。`,
}

// 一般的な釣り動画のデータ
const badChannelData = {
  radarData: [
    { axis: "情報の正確性", value: 25 },
    { axis: "根拠の明示", value: 18 },
    { axis: "誠実な表現", value: 22 },
    { axis: "視聴者への配慮", value: 30 },
    { axis: "社会的価値", value: 15 },
  ],
  videoData: {
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop",
    title: "【衝撃の結末】これを知らないと人生損します...99%の人が気づいていない真実",
    channel: "エンタメ太郎チャンネル",
    publishedAt: "2024年3月15日",
    views: "120万回",
    likes: "4.5万",
    comments: "1,200件",
  },
  score: 22,
  aiComment: `サムネイルの赤い極太フォントと「衝撃の結末」というタイトルは、視聴者の不安を煽る典型的な手法です。内容に根拠となるデータや出典が示されておらず、誇張表現が目立ちます。情報の信頼性は低いと判断します。`,
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
}: {
  url: string
  setUrl: (url: string) => void
  onAnalyze: () => void
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
            className="flex-1 h-14 px-6 text-base bg-card border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/50"
          />
          <Button
            onClick={onAnalyze}
            disabled={!url}
            className="h-14 px-8 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300 disabled:opacity-40"
          >
            <Search className="w-5 h-5 mr-2" />
            分析する
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/60 pt-4">
          「より善い情報」チャンネルのURLを入力すると高スコアが表示されます
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
            AIが動画の「善さ」を分析中...
          </p>
          <p className="text-sm text-muted-foreground">
            しばらくお待ちください
          </p>
        </div>
      </div>
    </div>
  )
}

function ResultSection({ 
  onReset, 
  isGoodChannel 
}: { 
  onReset: () => void
  isGoodChannel: boolean 
}) {
  const [animate, setAnimate] = useState(false)
  const data = isGoodChannel ? goodChannelData : badChannelData

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const getRadarColor = (score: number) => {
    if (score >= 60) return "#34d399"
    if (score >= 40) return "#fbbf24"
    return "#f87171"
  }

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
          <Card className="bg-card border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video relative">
                <img
                  src={data.videoData.thumbnail}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-foreground leading-relaxed">
                  {data.videoData.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.videoData.channel}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-secondary/50">
                    <Calendar className="w-3 h-3 mr-1" />
                    {data.videoData.publishedAt}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-secondary/50">
                    <Play className="w-3 h-3 mr-1" />
                    {data.videoData.views}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-secondary/50">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {data.videoData.likes}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-secondary/50">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {data.videoData.comments}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground">
                善さスコア
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <CircularProgress score={data.score} animate={animate} />
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground">
                5軸分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.radarData} cx="50%" cy="50%" outerRadius="70%">
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
                      stroke={getRadarColor(data.score)}
                      fill={getRadarColor(data.score)}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AIコメント
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                {data.aiComment}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ZenAnalyzer() {
  const [state, setState] = useState<AppState>("initial")
  const [url, setUrl] = useState("")
  const [isGoodChannel, setIsGoodChannel] = useState(false)

  const handleAnalyze = () => {
    // 「より善い情報」チャンネルかどうかを判定
    const isGood = url.toLowerCase().includes("より善い情報") || 
                   url.toLowerCase().includes("yori-yoi") ||
                   url.toLowerCase().includes("good-info")
    setIsGoodChannel(isGood)
    
    setState("loading")
    setTimeout(() => {
      setState("result")
    }, 2500)
  }

  const handleReset = () => {
    setState("initial")
    setUrl("")
    setIsGoodChannel(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {state === "initial" && (
        <HeroSection url={url} setUrl={setUrl} onAnalyze={handleAnalyze} />
      )}
      {state === "loading" && <LoadingSection />}
      {state === "result" && <ResultSection onReset={handleReset} isGoodChannel={isGoodChannel} />}
    </main>
  )
}
