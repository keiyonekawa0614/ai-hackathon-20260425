"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Shield,
  Zap,
  TrendingUp,
  Eye,
  ArrowRight,
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
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (displayScore / 100) * circumference

  useEffect(() => {
    if (animate) {
      const duration = 2000
      const startTime = Date.now()
      const animateScore = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 4)
        setDisplayScore(Math.round(score * easeOut))
        if (progress < 1) {
          requestAnimationFrame(animateScore)
        }
      }
      requestAnimationFrame(animateScore)
    }
  }, [animate, score])

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "非常に善い"
    if (s >= 60) return "善い情報"
    if (s >= 40) return "要確認"
    return "注意が必要"
  }

  const getScoreColor = (s: number) => {
    if (s >= 60) return "text-emerald-400"
    if (s >= 40) return "text-amber-400"
    return "text-red-400"
  }

  const getStrokeColor = (s: number) => {
    if (s >= 60) return "url(#gradient-green)"
    if (s >= 40) return "url(#gradient-yellow)"
    return "url(#gradient-red)"
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-52 h-52">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-white/5"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-1000 ease-out"
            style={{
              stroke: getStrokeColor(displayScore),
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-6xl font-light tracking-tight ${getScoreColor(displayScore)}`}>
            {displayScore}
          </span>
          <span className="text-sm text-muted-foreground/60 mt-1">/ 100</span>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10">
        {displayScore >= 60 ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : displayScore >= 40 ? (
          <AlertCircle className="w-5 h-5 text-amber-400" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
        <p className={`text-base font-medium ${getScoreColor(displayScore)}`}>
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-radial" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      
      <div className="text-center max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            AI搭載の動画分析ツール
          </div>
          <h1 className="text-7xl md:text-8xl font-extralight tracking-tight">
            <span className="gradient-text">ZEN</span>
          </h1>
          <p className="text-2xl md:text-3xl font-light text-muted-foreground">
            最短で、より善い情報を。
          </p>
        </div>

        <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-xl mx-auto">
          YouTubeの動画URLを入力するだけで、
          AIがその動画の信頼性を多角的に分析します。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto pt-4">
          <div className="flex-1 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 to-blue-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <Input
              type="url"
              placeholder="YouTubeのURLを入力..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && url && onAnalyze()}
              className="relative flex-1 h-16 px-6 text-lg bg-card/80 backdrop-blur-sm border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-300 placeholder:text-muted-foreground/40"
            />
          </div>
          <Button
            onClick={onAnalyze}
            disabled={!url || isLoading}
            className="h-16 px-10 text-lg font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-2xl transition-all duration-300 disabled:opacity-40 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <Search className="w-5 h-5 mr-2" />
            分析する
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            高速分析
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            信頼性評価
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            5軸スコア
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSection({ stage }: { stage: "video" | "analysis" }) {
  const messages = {
    video: {
      title: "動画情報を取得中",
      subtitle: "YouTube APIから情報を取得しています",
    },
    analysis: {
      title: "AIが動画を分析中",
      subtitle: "信頼性評価を実行しています",
    },
  }

  const steps = [
    { icon: Eye, text: "動画メタデータを解析", delay: 0 },
    { icon: Search, text: "ファクトチェックを実行", delay: 200 },
    { icon: Shield, text: "チャンネル評判を調査", delay: 400 },
    { icon: Sparkles, text: "総合スコアを算出", delay: 600 },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-radial" />
      
      <div className="text-center space-y-10 animate-in fade-in duration-500 relative z-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-3xl font-light text-foreground">
            {messages[stage].title}
          </p>
          <p className="text-base text-muted-foreground">
            {messages[stage].subtitle}
          </p>
        </div>
        
        {stage === "analysis" && (
          <div className="max-w-sm mx-auto space-y-3 pt-4">
            {steps.map((step, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${step.delay}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm text-muted-foreground">{step.text}</span>
                <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            ))}
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      
      <div className="text-center space-y-8 animate-in fade-in duration-500 relative z-10">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div className="space-y-3">
          <p className="text-2xl font-light text-foreground">
            エラーが発生しました
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {message}
          </p>
        </div>
        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-xl border-white/10 hover:bg-white/5"
        >
          トップに戻る
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
    { axis: "正確性", value: analysis.scores.accuracy, fullMark: 100 },
    { axis: "根拠", value: analysis.scores.evidenceQuality, fullMark: 100 },
    { axis: "信頼性", value: analysis.scores.trustworthiness, fullMark: 100 },
    { axis: "透明性", value: analysis.scores.transparency, fullMark: 100 },
    { axis: "社会的価値", value: analysis.scores.socialValue, fullMark: 100 },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 60) return "#34d399"
    if (score >= 40) return "#fbbf24"
    return "#f87171"
  }

  const thumbnail = videoInfo.thumbnails.maxres?.url || 
                    videoInfo.thumbnails.high?.url || 
                    videoInfo.thumbnails.medium?.url ||
                    videoInfo.thumbnails.default?.url

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            分析完了
          </div>
          <h2 className="text-4xl md:text-5xl font-extralight text-foreground">
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

        {/* Main Score Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "100ms" }}>
          {/* Video Info */}
          <Card className="glass rounded-3xl overflow-hidden lg:col-span-2">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 aspect-video md:aspect-auto relative">
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6 md:p-8 md:w-3/5 space-y-4">
                  <h3 className="text-xl font-medium text-foreground leading-relaxed line-clamp-2">
                    {videoInfo.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      {videoInfo.channelName}
                    </p>
                    <Badge className="rounded-full px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <Users className="w-3 h-3 mr-1" />
                      {formatNumber(videoInfo.subscriberCount)}人
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs bg-white/5 border border-white/10">
                      <Calendar className="w-3 h-3 mr-1.5" />
                      {formatDate(videoInfo.publishedAt)}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs bg-white/5 border border-white/10">
                      <Play className="w-3 h-3 mr-1.5" />
                      {formatNumber(videoInfo.viewCount)}回
                    </Badge>
                    <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs bg-white/5 border border-white/10">
                      <ThumbsUp className="w-3 h-3 mr-1.5" />
                      {formatNumber(videoInfo.likeCount)}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs bg-white/5 border border-white/10">
                      <MessageCircle className="w-3 h-3 mr-1.5" />
                      {formatNumber(videoInfo.commentCount)}件
                    </Badge>
                  </div>
                  {videoInfo.tags && videoInfo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      {videoInfo.tags.slice(0, 4).map((tag, i) => (
                        <Badge key={i} variant="outline" className="rounded-full px-2 py-0.5 text-xs border-white/10">
                          {tag}
                        </Badge>
                      ))}
                      {videoInfo.tags.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                          +{videoInfo.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score */}
          <Card className="glass rounded-3xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-center text-lg font-medium text-foreground">
                善さスコア
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <CircularProgress score={analysis.overallScore} animate={animate} />
            </CardContent>
          </Card>
        </div>

        {/* Analysis Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <Card className="glass rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                5軸分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                      axisLine={false}
                    />
                    <Radar
                      name="スコア"
                      dataKey="value"
                      stroke={getScoreColor(analysis.overallScore)}
                      fill={getScoreColor(analysis.overallScore)}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Channel Reputation */}
          <Card className="glass rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "300ms" }}>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                チャンネル評判
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.reputation.summary}
              </p>
              {analysis.reputation.positivePoints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-emerald-400">良い点</p>
                  <ul className="space-y-2">
                    {analysis.reputation.positivePoints.map((point, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.reputation.negativePoints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-red-400">懸念点</p>
                  <ul className="space-y-2">
                    {analysis.reputation.negativePoints.map((point, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score Details */}
          <Card className="glass rounded-3xl lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "400ms" }}>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI総合評価
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { label: "情報の正確性", value: analysis.scores.accuracy, icon: CheckCircle2 },
                  { label: "根拠の明示", value: analysis.scores.evidenceQuality, icon: Search },
                  { label: "信頼性", value: analysis.scores.trustworthiness, icon: Shield },
                  { label: "透明性", value: analysis.scores.transparency, icon: Eye },
                  { label: "社会的価値", value: analysis.scores.socialValue, icon: Users },
                ].map((item) => (
                  <div 
                    key={item.label} 
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3"
                  >
                    <item.icon className="w-6 h-6 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p 
                      className="text-3xl font-light"
                      style={{ color: getScoreColor(item.value) }}
                    >
                      {item.value}
                    </p>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: getScoreColor(item.value),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [appState, setAppState] = useState<AppState>("initial")
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleAnalyze = async () => {
    if (!url) return

    try {
      // Step 1: Get video info
      setAppState("loading-video")
      const videoRes = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!videoRes.ok) {
        const error = await videoRes.json()
        throw new Error(error.error || "動画情報の取得に失敗しました")
      }

      const videoData = await videoRes.json()
      setVideoInfo(videoData)

      // Step 2: Analyze video
      setAppState("loading-analysis")
      const analysisRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoInfo: videoData }),
      })

      if (!analysisRes.ok) {
        const error = await analysisRes.json()
        throw new Error(error.error || "分析に失敗しました")
      }

      const analysisData = await analysisRes.json()
      setAnalysis(analysisData)
      setAppState("result")

    } catch (error) {
      console.error("Analysis error:", error)
      setErrorMessage(error instanceof Error ? error.message : "予期せぬエラーが発生しました")
      setAppState("error")
    }
  }

  const handleReset = () => {
    setUrl("")
    setVideoInfo(null)
    setAnalysis(null)
    setAppState("initial")
    setErrorMessage("")
  }

  return (
    <main className="min-h-screen bg-background">
      {appState === "initial" && (
        <HeroSection
          url={url}
          setUrl={setUrl}
          onAnalyze={handleAnalyze}
          isLoading={false}
        />
      )}
      {appState === "loading-video" && <LoadingSection stage="video" />}
      {appState === "loading-analysis" && <LoadingSection stage="analysis" />}
      {appState === "error" && (
        <ErrorSection message={errorMessage} onReset={handleReset} />
      )}
      {appState === "result" && videoInfo && analysis && (
        <ResultSection
          onReset={handleReset}
          videoInfo={videoInfo}
          analysis={analysis}
        />
      )}
    </main>
  )
}
