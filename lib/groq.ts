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
}

interface GeneratedQuestion {
  question: string;
  explanation: string;
  tags: string[];
}

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GeneratedQuestion[]> {
  const subtopicLine = input.subtopic ? `\nFocus specifically on the sub-topic: "${input.subtopic}".` : '';
  const prompt = `
You are a senior software engineer conducting a technical interview.
Generate exactly ${input.count} interview questions on the topic: "${input.topic}" from the domain: "${input.domain}".${subtopicLine}
Difficulty level: ${input.difficulty}.

Return ONLY a valid JSON array. No explanation, no markdown, no preamble.

Format:
[
  {
    "question": "The interview question text",
    "explanation": "A thorough explanation covering: what the correct answer is, why it is correct, key concepts the interviewer is testing, common mistakes candidates make, and a code example if applicable.",
    "tags": ["tag1", "tag2"]
  }
]
  `.trim();

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model:       GROQ_MODEL_FAST,
    max_tokens:  4096,
    temperature: 0.7,
    messages: [
      { role: 'system', content: 'You are a technical interview expert. Always respond with valid JSON only.' },
      { role: 'user',   content: prompt },
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
