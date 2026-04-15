import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { VoiceEvaluation } from '@/types';

let _groq: Groq | null = null;

function getGroqClient() {
  if (!_groq) {
    _groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });
  }
  return _groq;
}

export const GROQ_MODEL_FAST    = 'llama-3.1-8b-instant';
export const GROQ_MODEL_QUALITY = 'llama-3.3-70b-versatile';
export const WHISPER_MODEL      = 'whisper-large-v3-turbo';

export type { ChatCompletionMessageParam };

interface GenerateQuestionsInput {
  domain: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  count: number;
  role?: string;
}

interface GeneratedQuestion {
  question: string;
  explanation: string;
  tags: string[];
}

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GeneratedQuestion[]> {
  const subtopicLine = input.subtopic ? `\nFocus specifically on the sub-topic: "${input.subtopic}".` : '';
  const roleLine = input.role
    ? `\nThe candidate is interviewing for the role of: "${input.role}". Bias the questions toward what an interviewer actually asks for this role — common responsibilities, day-to-day problems, real trade-offs they'd face. Skip anything off-role unless it genuinely overlaps.`
    : '';
  const prompt = `
You are a senior software engineer creating a study guide for a technical interview candidate.
Generate exactly ${input.count} interview questions on the topic: "${input.topic}" from the domain: "${input.domain}".${subtopicLine}${roleLine}
Difficulty level: ${input.difficulty}.

For EACH question, the "explanation" field must be the FULL ANSWER to the question — the kind of answer
a strong candidate would give. It must directly answer the question with complete reasoning, not describe
what the question is testing or what the interviewer is looking for.

Rules for "explanation":
- Start by directly answering the question. Do NOT restate or rephrase the question.
- Do NOT use meta phrases like "this question tests…", "the interviewer wants…", "candidates should…",
  "a good answer would mention…". Just give the answer itself.
- Explain the reasoning, mention the underlying concepts, and include trade-offs where relevant.
- If the question asks for code, an algorithm, or output — include the actual code / algorithm / output.
- Use short paragraphs or bullet points. Keep it tight and substantive, not fluffy.
- 4–10 sentences typically; longer if code is needed.

Return ONLY a valid JSON array. No markdown, no preamble, no trailing text.

Format:
[
  {
    "question": "The interview question text",
    "explanation": "The complete answer to the question, written as if you are the candidate answering it.",
    "tags": ["tag1", "tag2"]
  }
]
  `.trim();

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    // Use the quality model — answers need depth, and 70B significantly outperforms 8B on
    // technical explanation quality. The extra ~1–2s is worth it for a study resource.
    model:       GROQ_MODEL_QUALITY,
    max_tokens:  6144,
    temperature: 0.6,
    messages: [
      {
        role: 'system',
        content:
          'You are a technical interview expert. The "explanation" field is always the direct, complete answer to the question — never a description of what the question is testing. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '[]';

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as GeneratedQuestion[];
  } catch {
    console.error('Failed to parse Groq response:', raw);
    return [];
  }
}

interface GenerateTopicsInput {
  domain: string;
}

export async function generateTopics(input: GenerateTopicsInput): Promise<string[]> {
  const prompt = `
You are an expert in "${input.domain}".
List 8 to 12 important subtopics or areas within "${input.domain}" that someone might be asked about in an interview or exam.

Return ONLY a valid JSON array of strings. No explanation, no markdown, no preamble.

Example format:
["Topic 1", "Topic 2", "Topic 3"]
  `.trim();

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model:       GROQ_MODEL_FAST,
    max_tokens:  1024,
    temperature: 0.7,
    messages: [
      { role: 'system', content: 'You are a knowledgeable expert. Always respond with valid JSON only.' },
      { role: 'user',   content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '[]';

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as string[];
  } catch {
    console.error('Failed to parse topics response:', raw);
    return [];
  }
}

interface EvaluateAnswerInput {
  question:   string;
  userAnswer: string;
  domain:     string;
}

interface EvaluationResult {
  score:       number;
  strengths:   string[];
  gaps:        string[];
  feedback:    string;
  modelAnswer: string;
}

export async function evaluateAnswer(input: EvaluateAnswerInput): Promise<EvaluationResult> {
  const prompt = `
You are a senior engineer evaluating a technical interview response.

Domain: ${input.domain}
Question: ${input.question}
Candidate's Answer: ${input.userAnswer}

Evaluate the answer strictly and fairly. Return ONLY valid JSON. No markdown, no extra text.

Format:
{
  "score": <integer 0-10>,
  "strengths": ["<what the candidate got right>"],
  "gaps": ["<what was missing or incorrect>"],
  "feedback": "<one paragraph of constructive, specific feedback>",
  "modelAnswer": "<a comprehensive ideal answer to this question>"
}
  `.trim();

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model:       GROQ_MODEL_QUALITY,
    max_tokens:  2048,
    temperature: 0.3,
    messages: [
      { role: 'system', content: 'You are a strict but fair technical interview evaluator. Always respond with valid JSON only.' },
      { role: 'user',   content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as EvaluationResult;
  } catch {
    console.error('Failed to parse evaluation response:', raw);
    return {
      score:       0,
      strengths:   [],
      gaps:        ['Could not parse AI response. Please try again.'],
      feedback:    'Evaluation failed. Please retry.',
      modelAnswer: '',
    };
  }
}

// ── Doubt chatbot ────────────────────────────────────────────────────

export interface DoubtChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DoubtChatContext {
  domain?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: string;
  role?: string;
}

export async function chatDoubt(
  messages: DoubtChatMessage[],
  context?: DoubtChatContext
): Promise<string> {
  const ctxParts: string[] = [];
  if (context?.role) ctxParts.push(`Target role: ${context.role}`);
  if (context?.domain) ctxParts.push(`Domain: ${context.domain}`);
  if (context?.topic) ctxParts.push(`Topic: ${context.topic}`);
  if (context?.subtopic) ctxParts.push(`Sub-topic: ${context.subtopic}`);
  if (context?.difficulty) ctxParts.push(`Difficulty: ${context.difficulty}`);
  const contextBlock =
    ctxParts.length > 0
      ? `The student is currently preparing on:\n${ctxParts.join('\n')}\n` +
        (context?.role
          ? `When the question is ambiguous, frame answers through the lens of a "${context.role}" interview — focus on what actually matters for that role.\n\n`
          : `Prefer answers relevant to this context when the question is ambiguous.\n\n`)
      : '';

  const systemPrompt = `You are PrepAI, a friendly and expert technical tutor helping a student prepare for their software engineering interviews.

${contextBlock}Guidelines:
- Answer the student's doubt directly and clearly. Do not restate the question.
- Use markdown: short paragraphs, bullet points, **bold** for key terms, and fenced code blocks with language tags for any code.
- Keep answers tight — typically 4-10 sentences, longer only when code or a worked example is needed.
- When code helps, include real, runnable snippets.
- If the question is vague, ask one short clarifying question instead of guessing.
- If it's off-topic (not a technical / interview / CS question), politely steer back.
- Never make up APIs, syntax, or behavior. If you're not sure, say so.`;

  const chatMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model:       GROQ_MODEL_QUALITY,
    messages:    chatMessages,
    temperature: 0.5,
    max_tokens:  1024,
  });

  return completion.choices[0]?.message?.content ?? '';
}

// ── Voice Interview helpers ──────────────────────────────────────────

export async function transcribeAudio(file: File): Promise<string> {
  const groq = getGroqClient();
  const transcription = await groq.audio.transcriptions.create({
    model: WHISPER_MODEL,
    file,
    language: 'en',
  });
  return transcription.text;
}

export async function conductInterviewTurn(messages: ChatCompletionMessageParam[]): Promise<string> {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model:       GROQ_MODEL_QUALITY,
    messages,
    temperature: 0.6,
    max_tokens:  512,
  });
  return completion.choices[0]?.message?.content ?? '';
}

export async function evaluateInterview(
  transcript: string,
  domain: string,
  topic: string,
): Promise<VoiceEvaluation> {
  const prompt = `
You are a senior technical interview evaluator. You just observed a voice interview.

Domain: ${domain}
Topic: ${topic}

Full interview transcript:
${transcript}

Evaluate the candidate's overall performance. Return ONLY valid JSON. No markdown, no extra text.

Format:
{
  "overallScore": <integer 0-100>,
  "strengths": ["<what the candidate demonstrated well>"],
  "weaknesses": ["<areas for improvement>"],
  "topicScores": [
    { "topic": "<specific area discussed>", "score": <integer 0-10>, "comment": "<brief assessment>" }
  ],
  "summary": "<2-3 sentence overall assessment>",
  "recommendation": "<specific advice for improvement>"
}
  `.trim();

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model:       GROQ_MODEL_QUALITY,
    max_tokens:  2048,
    temperature: 0.3,
    messages: [
      { role: 'system', content: 'You are a strict but fair technical interview evaluator. Always respond with valid JSON only.' },
      { role: 'user',   content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as VoiceEvaluation;
  } catch {
    console.error('Failed to parse voice evaluation:', raw);
    return {
      overallScore: 0,
      strengths: [],
      weaknesses: ['Could not parse evaluation. Please try again.'],
      topicScores: [],
      summary: 'Evaluation failed.',
      recommendation: '',
    };
  }
}
