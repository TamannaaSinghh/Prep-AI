'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renders AI-generated markdown (explanations, model answers, feedback) with
 * the Learnify theme — tidy typography, pill inline code, card-style fenced
 * code blocks, and hierarchical headings. Safe by default: no raw HTML is
 * ever rendered (react-markdown escapes it).
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn('text-sm leading-relaxed text-foreground/90 space-y-3', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ── Headings ──────────────────────────────
          h1: ({ children }) => (
            <h3 className="text-base font-bold tracking-tight text-foreground mt-4 first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="text-sm font-bold tracking-tight text-foreground mt-4 first:mt-0">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="text-sm font-semibold text-foreground mt-3 first:mt-0">
              {children}
            </h5>
          ),
          h4: ({ children }) => (
            <h6 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-3 first:mt-0">
              {children}
            </h6>
          ),

          // ── Paragraphs ────────────────────────────
          p: ({ children }) => (
            <p className="leading-relaxed">{children}</p>
          ),

          // ── Emphasis ──────────────────────────────
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,

          // ── Lists ─────────────────────────────────
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1.5 marker:text-primary/60">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1.5 marker:text-primary marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,

          // ── Blockquote ────────────────────────────
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 bg-accent/40 pl-4 pr-3 py-2 rounded-r-lg italic text-muted-foreground">
              {children}
            </blockquote>
          ),

          // ── Links ─────────────────────────────────
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline font-medium"
            >
              {children}
            </a>
          ),

          // ── Code (inline + fenced) ────────────────
          code: ({ className: cls, children, ...rest }) => {
            // react-markdown passes block code as a `<code>` wrapped in `<pre>`.
            // We detect fenced blocks via the presence of a language class
            // (e.g. `language-js`). Anything else is inline.
            const isBlock = typeof cls === 'string' && cls.startsWith('language-');
            const language = isBlock ? cls.replace('language-', '') : null;

            if (isBlock) {
              // Light slate-100 text on the dark #0F172A pre background —
              // without this, text-foreground makes the code invisible in
              // light mode.
              return (
                <code
                  className={cn(
                    'block font-mono text-[12.5px] leading-relaxed text-slate-100 whitespace-pre',
                    cls
                  )}
                  data-language={language ?? undefined}
                  {...rest}
                >
                  {children}
                </code>
              );
            }

            // Inline code — use card-colored chip so it's readable on any
            // parent background (including the chatbot's accent bubble).
            return (
              <code
                className="font-mono text-[0.85em] px-1.5 py-0.5 rounded-md bg-card text-primary border border-primary/20"
                {...rest}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            // Try to extract language from the child <code> for the corner label.
            // react-markdown gives us a single child code element.
            let language: string | null = null;
            const child: any = Array.isArray(children) ? children[0] : children;
            const langClass: string | undefined = child?.props?.className;
            if (langClass && langClass.startsWith('language-')) {
              language = langClass.replace('language-', '');
            }

            return (
              <div className="relative my-3 rounded-xl border bg-[#0F172A] text-slate-100 shadow-soft overflow-hidden">
                {/* header bar with language + window dots */}
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/5 bg-white/[0.03]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    {language ?? 'code'}
                  </span>
                </div>
                <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-relaxed">
                  {children}
                </pre>
              </div>
            );
          },

          // ── Tables (GFM) ──────────────────────────
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border">
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-accent/40 text-foreground">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold border-b">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-border/60">{children}</td>
          ),

          // ── Horizontal rule ───────────────────────
          hr: () => <hr className="my-4 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
