'use client';

import { signIn, useSession } from 'next-auth/react';
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
  Shield,
  Zap,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Target,
  Rocket,
  TrendingUp,
  Star,
} from 'lucide-react';

const DOMAINS = [
  'DSA',
  'System Design',
  'JavaScript',
  'React',
  'DBMS',
  'Operating Systems',
  'Networking',
];

const FEATURES = [
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
    icon: AudioLines,
    title: 'Voice Interviews',
    desc: 'Speak with a conversational AI interviewer. Push-to-talk, hear the AI reply, and get per-topic scoring on clarity, depth and structure.',
    tint: 'bg-[#9F7AEA]/15',
    iconClass: 'text-[#7C5BE6]',
    badge: 'New',
  },
  {
    icon: BarChart3,
    title: 'Structured AI Feedback',
    desc: 'Every answer gets a score, strengths, gaps, and a model answer — so you know exactly what to improve next.',
    tint: 'bg-green-500/10',
    iconClass: 'text-green-600',
  },
  {
    icon: Bookmark,
    title: 'Smart Bookmarks',
    desc: 'Save tricky questions for later. Build your own curated revision list with explanations attached.',
    tint: 'bg-amber-500/10',
    iconClass: 'text-amber-600',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    desc: 'Visualize your improvement with score-over-time charts and a domain coverage map. See your weak areas at a glance.',
    tint: 'bg-cyan-500/10',
    iconClass: 'text-cyan-600',
  },
];

const STEPS = [
  {
    icon: Target,
    step: '01',
    title: 'Pick your domain',
    desc: 'Choose from 7 domains, 50+ topics, and three difficulty levels. Configure your session in seconds.',
  },
  {
    icon: Rocket,
    step: '02',
    title: 'Practice, mock or speak',
    desc: 'Generate practice questions with explanations, take a timed mock, or jump into a live voice interview.',
  },
  {
    icon: TrendingUp,
    step: '03',
    title: 'Review & improve',
    desc: 'Get structured feedback, bookmark weak spots, and watch your scores climb on the progress dashboard.',
  },
];

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
      <nav className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[#9F7AEA] flex items-center justify-center shadow-pill">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">PrepAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
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
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-30%] left-[-15%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-25%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[#9F7AEA]/10 blur-3xl" />
          <div className="absolute top-[30%] right-[25%] w-[35%] h-[35%] rounded-full bg-accent/60 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <div className="space-y-7">
              <Badge variant="secondary" className="gap-1.5 bg-card text-primary border border-primary/20">
                <Zap className="h-3 w-3" />
                Powered by Groq &middot; LLaMA 3 inference
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                Ace your next
                <span className="block bg-gradient-to-r from-primary to-[#9F7AEA] bg-clip-text text-transparent">
                  interview
                </span>
                with an AI that listens.
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Practice with AI-generated questions, take timed mock interviews, and even
                speak with a live voice interviewer — all tailored to your domain, topic,
                and skill level.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={handleSignIn}
                  className="h-12 px-7 text-base gap-3 shadow-soft-lg"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Free forever
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> No credit card
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> One-click sign in
                </span>
              </div>
            </div>

            {/* Right - Mock preview card */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/15 via-[#9F7AEA]/15 to-accent/30 rounded-3xl blur-2xl" />
              <Card className="relative shadow-soft-lg">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Mock Interview</p>
                        <p className="text-xs text-muted-foreground">React &middot; Hooks &middot; Advanced</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1.5 bg-accent text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      Live
                    </Badge>
                  </div>

                  <div className="space-y-4 rounded-2xl bg-muted/60 p-5 border">
                    <p className="text-sm font-medium leading-relaxed">
                      Q. Explain the difference between{' '}
                      <code className="px-1.5 py-0.5 rounded bg-card text-primary text-xs">useEffect</code>{' '}
                      and{' '}
                      <code className="px-1.5 py-0.5 rounded bg-card text-primary text-xs">useLayoutEffect</code>.
                      When would you choose one over the other?
                    </p>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        2:45 remaining
                      </div>
                      <div className="text-xs font-bold text-green-600 inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-green-600" /> 8 / 10
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <p className="text-2xl font-bold text-green-600">92%</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                        Accuracy
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <p className="text-2xl font-bold text-primary">47</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                        Questions
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-[#9F7AEA]/10 border border-[#9F7AEA]/20">
                      <p className="text-2xl font-bold text-[#7C5BE6]">12</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                        Mocks
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Trusted Domains Bar ───── */}
      <section className="border-y bg-card">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">
            Covers every major interview domain
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {DOMAINS.map((d) => (
              <span
                key={d}
                className="px-4 py-2 rounded-full bg-background border text-sm font-medium hover:border-primary/40 hover:bg-accent/50 transition-colors"
              >
                {d}
              </span>
            ))}
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
            Six features built around one goal — get you to the offer faster.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="group hover:-translate-y-1 hover:shadow-soft-md hover:border-primary/20"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`h-12 w-12 rounded-xl ${f.tint} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <f.icon className={`h-6 w-6 ${f.iconClass}`} />
                  </div>
                  {f.badge && (
                    <Badge className="text-[10px] uppercase tracking-wider">{f.badge}</Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
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

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* connector */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {STEPS.map((s) => (
              <div key={s.step} className="relative text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                  <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-[#9F7AEA] text-primary-foreground flex items-center justify-center shadow-soft-lg">
                    <s.icon className="h-7 w-7" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-primary tracking-widest mb-1">
                    STEP {s.step}
                  </p>
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
              <span className="bg-gradient-to-r from-primary to-[#9F7AEA] bg-clip-text text-transparent">
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
              structured feedback — all in under a second. No waiting, no subscriptions, no limits.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'Fresh AI questions every session — never stale',
                'Personalized to your domain, topic, and difficulty',
                'Structured feedback with scores, strengths and model answers',
                'Voice, timed mock, and practice modes in one app',
                'Bookmarks and progress tracking to close your gaps',
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Ultra-fast inference</p>
                    <p className="text-xs text-muted-foreground">Powered by Groq LPU</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Groq&apos;s Language Processing Units deliver 500–800 tokens/sec — that&apos;s
                  10–30× faster than standard GPU APIs. Your feedback arrives in under a second.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Private &amp; secure</p>
                    <p className="text-xs text-muted-foreground">Google OAuth + encrypted DB</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sign in with your Google account — we never see or store your password. Sessions
                  are kept in an encrypted MongoDB Atlas cluster and never shared with third parties.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-[#9F7AEA]/15 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-[#7C5BE6]" />
                  </div>
                  <div>
                    <p className="font-semibold">7 domains, 50+ topics</p>
                    <p className="text-xs text-muted-foreground">Comprehensive coverage</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  From arrays and graphs to system design, React hooks, and OS scheduling —
                  every major interview topic, with three difficulty levels.
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
            <Card className="relative overflow-hidden">
              <CardContent className="p-7 space-y-4">
                <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Practice</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generate 10 questions at a time with detailed explanations. Perfect for calm,
                  untimed study before a big interview.
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Untimed, explanation-first
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Bookmark in one click
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

            <Card className="relative overflow-hidden border-primary/20">
              <div className="absolute top-4 right-4">
                <Badge>New</Badge>
              </div>
              <CardContent className="p-7 space-y-4">
                <div className="h-11 w-11 rounded-xl bg-[#9F7AEA]/15 flex items-center justify-center">
                  <AudioLines className="h-5 w-5 text-[#7C5BE6]" />
                </div>
                <h3 className="text-lg font-semibold">Voice Interview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Push-to-talk, hear the AI reply, and watch the live transcript. Evaluated on
                  clarity, depth and structure — just like a real screening call.
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Real-time conversation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Final 0–100 score
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/40 to-[#9F7AEA]/10" />
        </div>
        <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-7">
          <Badge variant="secondary" className="mx-auto bg-card text-primary border border-primary/20">
            <Sparkles className="h-3 w-3 mr-1.5 text-primary" /> Ready when you are
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Stop reading sample answers.
            <br />
            Start{' '}
            <span className="bg-gradient-to-r from-primary to-[#9F7AEA] bg-clip-text text-transparent">
              practicing
            </span>{' '}
            today.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join PrepAI and transform the way you prepare for interviews.
            One click to sign in, zero cost to get started.
          </p>
          <Button
            size="lg"
            onClick={handleSignIn}
            className="h-14 px-10 text-base gap-3 shadow-soft-lg"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google — It&apos;s Free
            <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-xs text-muted-foreground">
            No credit card. Unlimited practice. Works on any device.
          </p>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t bg-card">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-[#9F7AEA] flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">PrepAI</span>
              <span className="text-sm text-muted-foreground">
                &middot; AI-powered interview readiness
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" /> Sessions saved to your account
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
