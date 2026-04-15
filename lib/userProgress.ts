import UserProgress from '@/models/UserProgress';
import { connectDB } from '@/lib/mongodb';

export const STREAK_MILESTONE = 6; // 1 coin awarded every N-day streak milestone

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d);
  dt.setDate(dt.getDate() + delta);
  return todayISO(dt);
}

/**
 * Returns the current consecutive-day streak ending at today (or yesterday with
 * a 1-day grace window). Returns 0 if the user hasn't been active today or
 * yesterday.
 */
export function computeStreak(activityDates: string[], today: string = todayISO()): number {
  if (!activityDates || activityDates.length === 0) return 0;
  const set = new Set(activityDates);
  const yesterday = addDaysISO(today, -1);

  // Grace: if user hasn't practiced today, they can still have a live streak
  // as long as they practiced yesterday. Beyond that, the streak is broken.
  if (!set.has(today) && !set.has(yesterday)) return 0;

  let cursor = set.has(today) ? today : yesterday;
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

interface GetOrCreateResult {
  interviewDate?: Date;
  interviewRole?: string;
  streak: number;
  longestStreak: number;
  activityDates: string[];
  coins: number;
}

/**
 * Reads a user's progress. Always returns a freshly-computed streak value
 * (so reads don't see a stale streak if the user has been inactive for a
 * couple of days).
 */
export async function getUserProgress(userId: string): Promise<GetOrCreateResult> {
  await connectDB();
  const doc = await UserProgress.findOne({ userId }).lean<any>();

  if (!doc) {
    return {
      interviewDate: undefined,
      interviewRole: undefined,
      streak: 0,
      longestStreak: 0,
      activityDates: [],
      coins: 0,
    };
  }

  const liveStreak = computeStreak(doc.activityDates ?? []);

  return {
    interviewDate: doc.interviewDate,
    interviewRole: doc.interviewRole ?? undefined,
    streak: liveStreak,
    longestStreak: Math.max(doc.longestStreak ?? 0, liveStreak),
    activityDates: doc.activityDates ?? [],
    coins: doc.coins ?? 0,
  };
}

/**
 * Records that the user was active today. Safe to call on every session save —
 * dedupes on date so calling it five times in one day counts as a single day.
 *
 * Awards +1 coin each time the streak crosses a new multiple of STREAK_MILESTONE
 * (6 by default). Handles streak breaks and restarts correctly: when the streak
 * resets below the last rewarded milestone, the tracker resets too, so the next
 * 6-day run can earn a fresh coin.
 */
export async function recordActivity(userId: string): Promise<{
  streak: number;
  longestStreak: number;
  coins: number;
  awardedCoin: boolean;
}> {
  await connectDB();
  const today = todayISO();

  let doc = await UserProgress.findOne({ userId });
  if (!doc) {
    doc = await UserProgress.create({
      userId,
      activityDates: [today],
      streak: 1,
      longestStreak: 1,
      coins: 0,
    });
    return { streak: 1, longestStreak: 1, coins: 0, awardedCoin: false };
  }

  const activityDates: string[] = doc.activityDates ?? [];
  const wasAlreadyLogged = activityDates.includes(today);
  if (!wasAlreadyLogged) {
    activityDates.push(today);
  }

  const oldStreak = doc.streak ?? 0;
  const newStreak = computeStreak(activityDates, today);

  const oldMilestoneCount = Math.floor(oldStreak / STREAK_MILESTONE);
  const newMilestoneCount = Math.floor(newStreak / STREAK_MILESTONE);
  const coinsToAward = Math.max(0, newMilestoneCount - oldMilestoneCount);

  doc.activityDates = activityDates;
  doc.streak = newStreak;
  doc.longestStreak = Math.max(doc.longestStreak ?? 0, newStreak);
  doc.coins = (doc.coins ?? 0) + coinsToAward;
  doc.updatedAt = new Date();
  await doc.save();

  return {
    streak: doc.streak,
    longestStreak: doc.longestStreak,
    coins: doc.coins,
    awardedCoin: coinsToAward > 0,
  };
}
