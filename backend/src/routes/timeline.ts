// src/routes/timeline.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /timeline
// Returns all user incidents sorted chronologically,
// grouped by date for easy timeline rendering.
router.get('/', async (req: Request, res: Response) => {
  const { from, to } = req.query;

  try {
    const incidents = await prisma.incident.findMany({
      where: {
        userId: req.user!.userId,
        ...(from ? { date: { gte: from.toString() } } : {}),
        ...(to   ? { date: { lte: to.toString()   } } : {}),
      },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });

    // Group by date
    const grouped: Record<string, typeof incidents> = {};
    for (const inc of incidents) {
      if (!grouped[inc.date]) grouped[inc.date] = [];
      grouped[inc.date].push(inc);
    }

    // Return as sorted array of { date, incidents }
    const timeline = Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({ date, incidents: items }));

    return res.json(timeline);
  } catch (err) {
    console.error('[timeline/GET]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
