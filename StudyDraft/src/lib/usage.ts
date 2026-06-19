import { prisma } from "./db";

const DAILY_LIMIT = 3;

export async function checkDailyUsage(userId: string): Promise<{
  canGenerate: boolean;
  remaining: number;
  usageCount: number;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return { canGenerate: false, remaining: 0, usageCount: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastUsage = user.lastUsageDate;

  if (!lastUsage || lastUsage < today) {
    await prisma.user.update({
      where: { id: userId },
      data: { dailyUsage: 0, lastUsageDate: today },
    });
    return { canGenerate: true, remaining: DAILY_LIMIT, usageCount: 0 };
  }

  const remaining = Math.max(0, DAILY_LIMIT - user.dailyUsage);
  return {
    canGenerate: remaining > 0,
    remaining,
    usageCount: user.dailyUsage,
  };
}

export async function incrementUsage(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyUsage: { increment: 1 },
      lastUsageDate: today,
    },
  });
}
