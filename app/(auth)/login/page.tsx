'use client';

import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Sparkles,
  FileText,
  AudioLines,
  BarChart3,
  BookOpen,
  Bookmark,
  History,
  Clock,
  Zap,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Target,
  Rocket,
  TrendingUp,
  Mic,
  Play,
  MessageCircle,
  Headphones,
  MonitorPlay,
  Volume2,
} from 'lucide-react';

/* ───────── Static data ───────── */

const FEATURES = [
  {
    icon: AudioLines,
    title: 'Voice Interviews',
    desc: 'Speak with a conversational AI interviewer. Push-to-talk, hear the AI reply, and get per-topic scoring on clarity, depth and structure.',
    tint: 'bg-[#9F7AEA]/15',
    iconClass: 'text-[#7C5BE6]',
    badge: 'Popular',
  },
  {
    icon: MonitorPlay,
    title: 'YouTube Learning',
    desc: 'Get curated YouTube videos for every topic you practice. Watch top tutorials right inside PrepAI without leaving your flow.',
    tint: 'bg-red-500/10',
    iconClass: 'text-red-500',
    badge: 'New',
  },
  {
    icon: Sparkles,
    title: 'AI Question Bank',
    desc: 'Generate fresh, unique questions for every session — pick a domain, topic and difficulty and get instant AI-crafted problems.',
    tint: 'bg-primary/10',
    iconClass: 'text-primary',
  },
  {
    icon: FileText,
    title: 'Timed Mock Interviews',
    desc: 'Simulate the real thing: 5 questions, a live timer per question, AI evaluation, and a scored summary at the end.',
    tint: 'bg-pink-500/10',
    iconClass: 'text-pink-600',
  },
  {
    icon: BarChart3,
    title: 'Structured AI Feedback',
    desc: 'Every answer gets a score, strengths, gaps, and a model answer — so you know exactly what to improve next.',
    tint: 'bg-green-500/10',
    iconClass: 'text-green-600',
  },
  {
    icon: MessageCircle,
    title: 'AI Doubt Assistant',
    desc: 'Stuck on a concept? Ask the floating chatbot. It knows your current topic and gives crisp, context-aware explanations.',
    tint: 'bg-amber-500/10',
    iconClass: 'text-amber-600',
  },
  {
    icon: Bookmark,
    title: 'Smart Bookmarks',
    desc: 'Save tricky questions for later. Build your own curated revision list with explanations attached.',
    tint: 'bg-cyan-500/10',
    iconClass: 'text-cyan-600',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    desc: 'Visualize your improvement with score-over-time charts, activity calendar, streak tracking, and a domain coverage map.',
    tint: 'bg-indigo-500/10',
    iconClass: 'text-indigo-600',
  },
];

const STEPS = [
  {
    icon: Target,
    step: '01',
    title: 'Pick your domain',
    desc: 'Type in any domain, any topic, any difficulty — there are no fixed lists. Configure your session in seconds.',
  },
  {
    icon: Rocket,
    step: '02',
    title: 'Practice, mock or speak',
    desc: 'Generate practice questions, take a timed mock, or jump into a live voice interview with AI.',
  },
  {
    icon: TrendingUp,
    step: '03',
    title: 'Review & improve',
    desc: 'Get structured feedback, watch YouTube tutorials, bookmark weak spots, and watch your scores climb.',
  },
];

/* ───────── Google icon SVG ───────── */

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ───────── YouTube icon SVG ───────── */

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}

/* ───────── Voice Waveform component ───────── */

function VoiceWaveform() {
  return (
    <div className="flex items-center gap-[3px] h-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="voice-bar w-[3px] rounded-full bg-primary"
          style={{ height: '12px' }}
        />
      ))}
    </div>
  );
}

/* ───────── Page ───────── */

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  const handleSignIn = () => signIn('google', { callbackUrl: '/dashboard' });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ───── Navbar ───── */}
      <nav className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur-xl animate-fade-in-down">
        <div className="max-w-6xl mx-auto px-6 h-[5.5rem] flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/main-logo.png"
              alt="Interview Prep AI"
              width={370}
              height={104}
              priority
              className="h-15 w-auto"
            />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#voice-interview" className="hover:text-foreground transition-colors">Voice Interview</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </div>
          <Button size="sm" onClick={handleSignIn} className="gap-2">
            Get started <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* ───── Hero ───── */}
      <section className="relative">
        {/* Animated background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-30%] left-[-15%] w-[70%] h-[70%] rounded-full bg-primary/8 blur-3xl animate-blob" />
          <div className="absolute bottom-[-25%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[#9F7AEA]/8 blur-3xl animate-blob delay-400" />
          <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-accent/50 blur-3xl animate-blob delay-800" />
          <div className="absolute top-[50%] left-[30%] w-[25%] h-[25%] rounded-full bg-pink-500/5 blur-3xl animate-blob delay-600" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <div className="space-y-7">
              <div className="animate-fade-in-up">
                <Badge variant="secondary" className="gap-1.5 bg-card text-primary border border-primary/20 shadow-soft">
                  <Zap className="h-3 w-3" />
                  Powered by Groq &middot; LLaMA 3 inference
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight animate-fade-in-up delay-100">
                Ace your next
                <span className="block text-primary py-1">
                  tech interview
                </span>
                with AI that listens.
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed animate-fade-in-up delay-200">
                Practice with AI-generated questions, take timed mock interviews,
                <strong className="text-foreground"> speak with a live voice interviewer</strong>, and
                learn from <strong className="text-foreground">curated YouTube tutorials</strong> — all
                tailored to your domain and skill level.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up delay-300">
                <Button
                  size="lg"
                  onClick={handleSignIn}
                  className="h-12 px-7 text-base gap-3 shadow-soft-lg group"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Sign in with Google
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 text-base gap-2"
                  onClick={() => document.getElementById('voice-interview')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <AudioLines className="h-4 w-4 text-[#7C5BE6]" />
                  See Voice Interview
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground animate-fade-in-up delay-400">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Free forever
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> No credit card
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> One-click sign in
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Voice + Video + AI
                </span>
              </div>
            </div>

            {/* Right - Animated preview card */}
            <div className="relative hidden lg:block animate-fade-in-right delay-300">
              <Card className="relative shadow-soft-lg animate-float-slow">
                <CardContent className="p-0 overflow-hidden">
                  {/* Voice Interview Preview */}
                  <div className="p-6 pb-4 bg-accent/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-pill">
                          <Headphones className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Voice Interview</p>
                          <p className="text-xs text-muted-foreground">React &middot; Hooks &middot; Advanced</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1.5 bg-green-500/10 text-green-600 border-green-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </Badge>
                    </div>

                    {/* Simulated transcript */}
                    <div className="space-y-3 rounded-xl bg-card/80 border p-4">
                      <div className="flex gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Brain className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          &ldquo;Can you explain the difference between useEffect and useLayoutEffect?&rdquo;
                        </p>
                      </div>
                      <div className="flex gap-2.5 justify-end">
                        <div className="bg-primary/10 rounded-lg px-3 py-1.5 max-w-[80%]">
                          <p className="text-xs leading-relaxed">
                            &ldquo;useEffect runs asynchronously after paint, while useLayoutEffect runs synchronously before...&rdquo;
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-3 pt-1">
                        <VoiceWaveform />
                        <span className="text-[10px] text-muted-foreground font-medium">Recording...</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="grid grid-cols-3 gap-px bg-border">
                    <div className="text-center p-3 bg-card">
                      <p className="text-xl font-bold text-green-600">92%</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Score</p>
                    </div>
                    <div className="text-center p-3 bg-card">
                      <p className="text-xl font-bold text-primary">47</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Questions</p>
                    </div>
                    <div className="text-center p-3 bg-card">
                      <p className="text-xl font-bold text-[#7C5BE6]">12</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Sessions</p>
                    </div>
                  </div>

                  {/* YouTube mini preview */}
                  <div className="p-4 border-t bg-card">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                        <YouTubeIcon className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate">React Hooks Deep Dive Tutorial</p>
                        <p className="text-[10px] text-muted-foreground">Recommended for your topic</p>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                        <Play className="h-3 w-3 text-red-500 fill-red-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>


      {/* ───── Voice Interview Showcase ───── */}
      <section id="voice-interview" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="mx-auto bg-[#9F7AEA]/10 text-[#7C5BE6] border-[#9F7AEA]/20">
              <Mic className="h-3 w-3 mr-1.5" /> Star Feature
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Talk to your AI interviewer
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Push-to-talk, hear the AI respond, and get scored on clarity, depth, and structure — just like a real screening call.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left - Voice interview mock */}
            <Card className="shadow-soft-lg border-[#9F7AEA]/20 overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b bg-card">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <AudioLines className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Voice Interview Session</p>
                      <p className="text-[10px] text-muted-foreground">System Design &middot; Intermediate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="tabular-nums">04:32</span>
                  </div>
                </div>

                {/* Conversation */}
                <div className="p-5 space-y-4 min-h-[240px]">
                  <div className="flex gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Brain className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-accent/50 border px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-sm leading-relaxed">How would you design a URL shortener like bit.ly? Walk me through the high-level architecture.</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-sm leading-relaxed">I&apos;d start with a hash-based approach using base62 encoding. We need an API gateway, a hashing service, and a key-value store like Redis for fast lookups...</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Brain className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-accent/50 border px-3.5 py-2.5 max-w-[85%]">
                      <p className="text-sm leading-relaxed">Good start! How would you handle hash collisions?</p>
                    </div>
                  </div>
                </div>

                {/* Push to talk bar */}
                <div className="border-t px-5 py-4 bg-muted/30 flex items-center justify-center gap-4">
                  <VoiceWaveform />
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-pill cursor-default">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium">Push to Talk</p>
                    <p className="text-[10px]">or hold Spacebar</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right - Benefits */}
            <div className="space-y-6">
              <div className="space-y-5">
                {[
                  {
                    icon: Volume2,
                    title: 'Natural conversation',
                    desc: 'Push-to-talk recording with AI that speaks back. Feels like a real phone screening.',
                  },
                  {
                    icon: BarChart3,
                    title: 'Per-topic scoring',
                    desc: 'Get scored 0-100 on clarity, depth, accuracy, and communication for each topic discussed.',
                  },
                  {
                    icon: FileText,
                    title: 'Full transcript review',
                    desc: 'Review the entire conversation transcript with AI evaluation, strengths, and areas for improvement.',
                  },
                  {
                    icon: History,
                    title: 'Session history',
                    desc: 'All voice sessions are saved. Track your progress and compare scores across attempts.',
                  },
                ].map((b) => (
                  <div key={b.title} className="flex gap-4 group">
                    <div className="h-11 w-11 rounded-xl bg-[#9F7AEA]/10 flex items-center justify-center shrink-0 group-hover:bg-[#9F7AEA]/20 transition-colors">
                      <b.icon className="h-5 w-5 text-[#7C5BE6]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-0.5">{b.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                onClick={handleSignIn}
                className="h-12 px-8 text-base gap-2 bg-primary shadow-soft-lg hover:shadow-pill group"
              >
                <Mic className="h-4 w-4" />
                Try Voice Interview
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───── YouTube Integration Showcase ───── */}
      <section className="border-y bg-card/60">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <div className="space-y-6 lg:order-2">
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                <YouTubeIcon className="h-3 w-3 mr-1.5" /> Integrated Learning
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Learn from the best
                <span className="text-red-500"> YouTube tutorials</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Every topic you practice comes with curated YouTube video recommendations.
                Watch tutorials, deep dives, and explanations without leaving PrepAI.
              </p>
              <div className="space-y-3">
                {[
                  'Auto-matched to your current domain and topic',
                  'Watch directly inside PrepAI — no tab switching',
                  'Curated top results from YouTube Data API',
                  'Video player with up-next queue and metadata',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                onClick={handleSignIn}
                className="h-12 px-8 text-base gap-2 bg-red-500 hover:bg-red-600 text-white shadow-soft-lg group"
              >
                <Play className="h-4 w-4 fill-white" />
                Start Learning
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Right - YouTube Preview */}
            <div className="lg:order-1">
              <Card className="shadow-soft-lg overflow-hidden border-red-500/10">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-card">
                    <div className="h-6 w-6 rounded-md bg-red-500/15 flex items-center justify-center">
                      <YouTubeIcon className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Top videos &middot; System Design
                    </p>
                  </div>

                  {/* Fake player */}
                  <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="h-14 w-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-soft-lg mx-auto">
                          <Play className="h-6 w-6 fill-current ml-0.5" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">System Design Interview</p>
                          <p className="text-gray-400 text-xs">Tech With Tim &middot; 45:23</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail list */}
                  <div className="p-3 bg-muted/30 grid grid-cols-3 gap-2">
                    {['URL Shortener Design', 'Load Balancer Deep Dive', 'Database Sharding'].map((title, i) => (
                      <div key={i} className="rounded-lg overflow-hidden border bg-card hover:border-primary/30 transition-colors cursor-default">
                        <div className="aspect-video bg-gray-800 flex items-center justify-center">
                          <Play className="h-4 w-4 text-white/60" />
                        </div>
                        <p className="text-[10px] font-medium p-1.5 truncate">{title}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Features Grid ───── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14 space-y-3">
          <Badge variant="secondary" className="mx-auto bg-accent text-primary">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything you need to prepare
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Eight powerful features built around one goal — get you to the offer faster.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="group hover:-translate-y-1.5 hover:shadow-soft-lg hover:border-primary/20 transition-all duration-300"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`h-11 w-11 rounded-xl ${f.tint} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <f.icon className={`h-5 w-5 ${f.iconClass}`} />
                  </div>
                  {f.badge && (
                    <Badge className="text-[9px] uppercase tracking-wider px-1.5 py-0">{f.badge}</Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section id="how-it-works" className="border-y bg-card/60">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14 space-y-3">
            <Badge variant="secondary" className="mx-auto bg-accent text-primary">
              How it works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Three steps to interview-ready
            </h2>
            <p className="text-muted-foreground text-lg">
              From sign-in to first feedback in under 60 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-border" />

            {STEPS.map((s, i) => (
              <div key={s.step} className="relative text-center space-y-5">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                  <div className="relative h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-soft-lg">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-card border-2 border-primary text-primary text-xs font-bold flex items-center justify-center shadow-soft">
                    {i + 1}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── About / Why PrepAI ───── */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="bg-accent text-primary">
              Why PrepAI
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for every student who
              <span className="text-primary">
                {' '}deserves great prep
              </span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              High-quality interview preparation shouldn&apos;t cost thousands of rupees.
              Static question banks get outdated, and most platforms don&apos;t give you real,
              structured feedback.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              PrepAI uses <strong className="text-foreground">Groq&apos;s ultra-fast LLaMA 3 inference</strong>{' '}
              to generate fresh questions, evaluate your answers in real time, and provide
              structured feedback — all in under a second. Plus, integrated YouTube tutorials
              and a voice interview mode that no other free platform offers.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'Fresh AI questions every session — never stale',
                'Voice interview with push-to-talk and AI responses',
                'Curated YouTube tutorials for every topic',
                'AI doubt chatbot for instant concept clarification',
                'Structured feedback with scores, strengths and model answers',
                'Progress tracking, streaks, and activity calendar',
                'Completely free — no paywall, no premium tier',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="group hover:shadow-soft-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-[#9F7AEA]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AudioLines className="h-6 w-6 text-[#7C5BE6]" />
                  </div>
                  <div>
                    <p className="font-semibold">Voice-first interviews</p>
                    <p className="text-xs text-muted-foreground">Push-to-talk AI conversations</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Speak naturally with an AI interviewer who listens, responds, and evaluates your
                  communication skills alongside technical depth. No typing — just talk.
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-soft-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <YouTubeIcon className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold">YouTube integration</p>
                    <p className="text-xs text-muted-foreground">Learn while you practice</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every topic comes with curated video recommendations. Watch tutorials right
                  inside PrepAI with a built-in player, queue, and topic matching.
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-soft-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Ultra-fast inference</p>
                    <p className="text-xs text-muted-foreground">Powered by Groq LPU</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Groq&apos;s Language Processing Units deliver 500-800 tokens/sec — that&apos;s
                  10-30x faster than standard GPU APIs. Your feedback arrives in under a second.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── Modes at a glance ───── */}
      <section className="border-y bg-card/60">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="secondary" className="mx-auto bg-accent text-primary">
              Three interview modes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Pick the mode that matches your moment
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Voice Interview - Featured */}
            <Card className="relative overflow-hidden border-[#9F7AEA]/30 shadow-soft-md md:scale-105 md:-translate-y-2">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary border-0">Most Popular</Badge>
              </div>
              <CardContent className="p-7 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#9F7AEA]/15 flex items-center justify-center">
                  <AudioLines className="h-6 w-6 text-[#7C5BE6]" />
                </div>
                <h3 className="text-lg font-semibold">Voice Interview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Push-to-talk, hear the AI reply, and watch the live transcript. Evaluated on
                  clarity, depth and structure — just like a real screening call.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Real-time AI conversation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Push-to-talk + spacebar
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Per-topic evaluation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Final 0-100 score
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-7 space-y-4">
                <div className="h-11 w-11 rounded-xl bg-pink-500/15 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold">Mock Interview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Five questions, a live timer per question, and AI evaluation at the end.
                  Scored summary with strengths, gaps, and model answers.
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Timed, 3 min per question
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Per-question scoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-7 space-y-4">
                <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Practice + Learn</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generate questions with detailed explanations, watch curated YouTube tutorials,
                  and ask the AI chatbot when stuck. Perfect for calm, deep study.
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> YouTube video integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> AI doubt chatbot
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-accent/40" />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-7">
          <Badge variant="secondary" className="mx-auto bg-card text-primary border border-primary/20 shadow-soft">
            <Sparkles className="h-3 w-3 mr-1.5 text-primary" /> Ready when you are
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Stop reading sample answers.
            <br />
            Start{' '}
            <span className="text-primary">
              practicing
            </span>{' '}
            today.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Voice interviews, YouTube tutorials, AI questions, mock exams, and a doubt chatbot —
            all free. One click to begin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleSignIn}
              className="h-14 px-10 text-base gap-3 shadow-soft-lg group"
            >
              <GoogleIcon className="h-5 w-5" />
              Sign in with Google — It&apos;s Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="inline-flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-[#7C5BE6]" /> Voice Interview
            </span>
            <span className="inline-flex items-center gap-1.5">
              <YouTubeIcon className="h-3.5 w-3.5 text-red-500" /> YouTube Learning
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-amber-500" /> AI Chatbot
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-pink-500" /> Mock Interviews
            </span>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t bg-card">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/main-logo.png"
                alt="Interview Prep AI"
                width={310}
                height={88}
                className="h-[4.75rem] w-auto"
              />
              <span className="text-sm text-muted-foreground">
                &middot; AI-powered interview readiness
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <AudioLines className="h-3.5 w-3.5 text-[#7C5BE6]" /> Voice Interviews
              </span>
              <span className="inline-flex items-center gap-1.5">
                <YouTubeIcon className="h-3.5 w-3.5 text-red-500" /> YouTube Integration
              </span>
              <span className="inline-flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" /> Sessions saved
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" /> Groq &amp; LLaMA 3
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
