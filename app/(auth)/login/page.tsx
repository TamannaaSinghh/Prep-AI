'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain,
  Sparkles,
  Mic,
  BarChart3,
  BookOpen,
  Bookmark,
  Clock,
  Shield,
  Zap,
  ChevronRight,
  Github,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ───── Navbar ───── */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Brain className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">PrepAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </div>
          <Button
            size="sm"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="gap-2"
          >
            Get Started <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* ───── Hero Section ───── */}
      <section className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-40%] left-[-20%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-15%] w-[60%] h-[60%] rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-secondary/50 text-xs font-medium text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Powered by LLaMA 3 &middot; Ultra-fast AI inference
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Ace your next
                <span className="block text-primary">interview</span>
                with AI
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Practice with AI-generated questions, take timed mock interviews,
                and get instant feedback — all tailored to your domain, topic, and skill level.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  className="h-13 px-8 text-base gap-3 shadow-lg shadow-primary/25"
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

              <p className="text-xs text-muted-foreground">
                Free to use &middot; No credit card required &middot; One-click sign in
              </p>
            </div>

            {/* Right - Stats / Visual Card */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Decorative card background */}
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl blur-xl" />
                <Card className="relative border-primary/10 shadow-2xl">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Mock Interview</p>
                        <p className="text-xs text-muted-foreground">React &middot; Hooks &middot; Advanced</p>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl bg-muted/50 p-5">
                      <p className="text-sm font-medium">Q: Explain the difference between useEffect and useLayoutEffect. When would you choose one over the other?</p>
                      <div className="h-px bg-border" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">2:45 remaining</span>
                        </div>
                        <div className="text-sm font-bold text-green-600">8/10</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-xl bg-green-500/10">
                        <p className="text-2xl font-bold text-green-600">92%</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Accuracy</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-blue-500/10">
                        <p className="text-2xl font-bold text-blue-600">47</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Questions</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-purple-500/10">
                        <p className="text-2xl font-bold text-purple-600">12</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Interviews</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Trusted Domains Bar ───── */}
      <section className="border-y bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">
            Covers all major interview domains
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['DSA', 'System Design', 'JavaScript', 'React', 'DBMS', 'OS', 'Networking'].map((d) => (
              <span key={d} className="px-4 py-2 rounded-full bg-background border text-sm font-medium">
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Features Grid ───── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need to prepare</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
            From generating fresh questions to taking full mock interviews with AI-powered feedback
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: 'AI Question Bank', desc: 'Generate fresh, unique questions every session — never practice the same stale set twice.', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { icon: Mic, title: 'Mock Interviews', desc: 'Timed sessions that simulate a real interview. Answer questions under pressure, just like the real thing.', color: 'text-red-500', bg: 'bg-red-500/10' },
            { icon: BarChart3, title: 'AI Feedback', desc: 'Get detailed scores, strengths, gaps, and model answers for every response you submit.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { icon: BookOpen, title: 'Concept Explainer', desc: 'Every question comes with a thorough explanation — learn why the answer is what it is.', color: 'text-green-500', bg: 'bg-green-500/10' },
            { icon: Bookmark, title: 'Bookmarks', desc: 'Save tricky questions for later review. Build your own curated revision list.', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { icon: BarChart3, title: 'Progress Tracking', desc: 'Visualize your improvement over time with interactive charts and domain coverage maps.', color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map((f) => (
            <Card key={f.title} className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section id="how-it-works" className="bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="text-muted-foreground mt-3 text-lg">Three steps to interview readiness</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick your domain', desc: 'Choose from DSA, System Design, JavaScript, React, DBMS, OS, or Networking. Select a topic and difficulty level.' },
              { step: '02', title: 'Practice or interview', desc: 'Generate practice questions with explanations, or jump into a timed mock interview with AI evaluation.' },
              { step: '03', title: 'Review & improve', desc: 'Get detailed feedback, track your scores over time, and bookmark questions to revisit your weak areas.' },
            ].map((s) => (
              <div key={s.step} className="relative text-center space-y-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── About Section ───── */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Built for every student who
              <span className="text-primary"> deserves great prep</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              PrepAI was created with a simple belief: high-quality interview preparation shouldn't
              be expensive or hard to access. Traditional coaching costs thousands, static question
              banks get outdated, and most platforms don't give you real feedback.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We use <strong className="text-foreground">Groq's ultra-fast LLaMA 3 inference</strong> to generate
              fresh questions, evaluate your answers in real-time, and provide structured feedback
              — all in under a second. No waiting, no subscriptions, no limits on how much you can practice.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'AI generates fresh questions every session — never stale',
                'Personalized to your domain, topic, and difficulty level',
                'Structured feedback with scores, strengths, and gaps',
                'Completely free and open — no paywall, no premium tiers',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Ultra-Fast Inference</p>
                    <p className="text-sm text-muted-foreground">Powered by Groq LPU</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Groq's Language Processing Units deliver 500-800 tokens/sec — that's
                  10-30x faster than standard GPU APIs. Your feedback arrives in under a second.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Private & Secure</p>
                    <p className="text-sm text-muted-foreground">Google OAuth + encrypted DB</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sign in securely with your Google account. Your data is stored in an encrypted MongoDB
                  Atlas cluster and never shared with third parties.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">7 Domains, 50+ Topics</p>
                    <p className="text-sm text-muted-foreground">Comprehensive coverage</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  From arrays and graphs to system design, React hooks, and OS scheduling —
                  every major interview topic is covered with three difficulty levels.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── CTA Section ───── */}
      <section className="border-t bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Start preparing today
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join PrepAI and transform the way you prepare for interviews.
            One click to sign in, zero cost to get started.
          </p>
          <Button
            size="lg"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="h-14 px-10 text-base gap-3 shadow-lg shadow-primary/25"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google — It's Free
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold">PrepAI</span>
              <span className="text-sm text-muted-foreground">&middot; AI-Powered Interview Readiness</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Groq, and LLaMA 3
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
