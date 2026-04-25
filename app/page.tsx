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
} from "lucide-react"

type AppState = "initial" | "loading" | "result"

const radarData = [
  { axis: "タイトル誇張度", value: 85 },
  { axis: "サムネ煽り度", value: 92 },
  { axis: "内容乖離度", value: 68 },
  { axis: "感情的釣り度", value: 78 },
  { axis: "緊急性演出度", value: 55 },
]

const dummyVideoData = {
  thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop",
  title: "【衝撃の結末】これを知らないと人生損します...99%の人が気づいていない真実",
  channel: "エンタメ太郎チャンネル",
  publishedAt: "2024年3月15日",
  views: "120万回",
  likes: "4.5万",
  comments: "1,200件",
}

const aiComment = `サムネイルの赤い極太フォントと「衝撃の結末」というタイトルの時点で、再生数を釣ろうとする煩悩が溢れ出ています。内容はただの日常vlogです。心静かにブラウザバックを推奨します。`

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
    if (s >= 80) return "釣り度: 極高"
    if (s >= 60) return "釣り度: 高"
    if (s >= 40) return "釣り度: 中"
    return "釣り度: 低"
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="80"
            cy="80"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="text-zen-green transition-all duration-1000 ease-out"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-light text-zen-ink">{displayScore}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-zen-ink">{getScoreLabel(displayScore)}</p>
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
      <div className="text-center max-w-2xl mx-auto space-y-8 animate-in fade-in duration-1000">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-extralight tracking-tight text-zen-ink">
            ZEN
          </h1>
          <p className="text-xl md:text-2xl font-light text-muted-foreground">
            最短で、より善い情報を。
          </p>
        </div>

        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
          YouTubeの動画URLを入力するだけで、
          <br className="hidden md:block" />
          AIがその動画の「釣り度」を分析します。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-8">
          <Input
            type="url"
            placeholder="YouTubeのURLを入力..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-14 px-6 text-base bg-white border-border rounded-2xl focus:ring-2 focus:ring-zen-green/20 focus:border-zen-green transition-all duration-300"
          />
          <Button
            onClick={onAnalyze}
            disabled={!url}
            className="h-14 px-8 text-base font-medium bg-zen-green hover:bg-zen-green/90 text-white rounded-2xl transition-all duration-300 disabled:opacity-40"
          >
            <Search className="w-5 h-5 mr-2" />
            分析する
          </Button>
        </div>
      </div>
    </div>
  )
}

function LoadingSection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="text-center space-y-8 animate-in fade-in duration-500">
        <Spinner className="w-12 h-12 text-zen-green mx-auto" />
        <div className="space-y-3">
          <p className="text-xl font-light text-zen-ink">
            AI（Gemini）が動画の「善」を分析中...
          </p>
          <p className="text-sm text-muted-foreground">
            しばらくお待ちください
          </p>
        </div>
      </div>
    </div>
  )
}

function ResultSection({ onReset }: { onReset: () => void }) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 md:py-20 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extralight text-zen-ink">
            分析結果
          </h2>
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-muted-foreground hover:text-zen-ink transition-colors"
          >
            別の動画を分析する
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm rounded-2xl border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video relative">
                <img
                  src={dummyVideoData.thumbnail}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-medium text-zen-ink leading-relaxed">
                  {dummyVideoData.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {dummyVideoData.channel}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {dummyVideoData.publishedAt}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    <Play className="w-3 h-3 mr-1" />
                    {dummyVideoData.views}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {dummyVideoData.likes}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {dummyVideoData.comments}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-2xl border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-zen-ink">
                総合スコア
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <CircularProgress score={78} animate={animate} />
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-2xl border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-zen-ink">
                5軸分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: "#666", fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "#999", fontSize: 10 }}
                    />
                    <Radar
                      name="釣り度"
                      dataKey="value"
                      stroke="#88B04B"
                      fill="#88B04B"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-2xl border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-zen-ink flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-zen-green" />
                AIコメント
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                {aiComment}
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

  const handleAnalyze = () => {
    setState("loading")
    setTimeout(() => {
      setState("result")
    }, 3000)
  }

  const handleReset = () => {
    setState("initial")
    setUrl("")
  }

  return (
    <main className="min-h-screen bg-background">
      {state === "initial" && (
        <HeroSection url={url} setUrl={setUrl} onAnalyze={handleAnalyze} />
      )}
      {state === "loading" && <LoadingSection />}
      {state === "result" && <ResultSection onReset={handleReset} />}
    </main>
  )
}
