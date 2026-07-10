// src/routes/incidents.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authenticate } from '../middleware/auth';
import { Severity, Status } from '@prisma/client';

const router = Router();
router.use(authenticate);

// ─── Helpers ──────────────────────────────────────────────────────────────

function toEnum<T extends Record<string, string>>(
  enumObj: T,
  value: string,
  label: string,
  res: Response
): T[keyof T] | null {
  const upper = value.toUpperCase() as keyof T;
  if (!(upper in enumObj)) {
    res.status(400).json({ error: `Invalid ${label}: ${value}` });
    return null;
  }
  return enumObj[upper];
}

// ─── GET /incidents ───────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const { severity, status, category, search } = req.query;

  try {
    const incidents = await prisma.incident.findMany({
      where: {
        userId: req.user!.userId,
        ...(severity ? { severity: severity.toString().toUpperCase() as Severity } : {}),
        ...(status   ? { status:   status.toString().toUpperCase()   as Status   } : {}),
        ...(category ? { category: { equals: category.toString(), mode: 'insensitive' } } : {}),
        ...(search   ? {
          OR: [
            { title:       { contains: search.toString(), mode: 'insensitive' } },
            { description: { contains: search.toString(), mode: 'insensitive' } },
            { tags:        { has: search.toString().toLowerCase() } },
          ],
        } : {}),
      },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });

    return res.json(incidents);
  } catch (err) {
    console.error('[incidents/GET]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /incidents/:id ───────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const incident = await prisma.incident.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    return res.json(incident);
  } catch (err) {
    console.error('[incidents/GET/:id]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /incidents ──────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const { title, category, severity, status, date, time, description, tags } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
  if (!date)          return res.status(400).json({ error: 'Date is required' });
  if (!time)          return res.status(400).json({ error: 'Time is required' });

  const sev = toEnum(Severity, severity || 'medium', 'severity', res);
  if (!sev) return;

  const stat = toEnum(Status, status || 'open', 'status', res);
  if (!stat) return;

  try {
    const incident = await prisma.incident.create({
      data: {
        title:       title.trim(),
        category:    category || 'Other',
        severity:    sev,
        status:      stat,
        date,
        time,
        description: description?.trim() || null,
        tags:        Array.isArray(tags) ? tags.map((t: string) => t.toLowerCase().trim()) : [],
        userId:      req.user!.userId,
      },
    });
    return res.status(201).json(incident);
  } catch (err) {
    console.error('[incidents/POST]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /incidents/:id ─────────────────────────────────────────────────
router.patch('/:id', async (req: Request, res: Response) => {
  const { title, category, severity, status, date, time, description, tags } = req.body;

  try {
    const existing = await prisma.incident.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Incident not found' });

    const data: Record<string, unknown> = {};
    if (title       !== undefined) data.title       = title.trim();
    if (category    !== undefined) data.category    = category;
    if (date        !== undefined) data.date        = date;
    if (time        !== undefined) data.time        = time;
    if (description !== undefined) data.description = description?.trim() || null;
    if (tags        !== undefined) data.tags        = Array.isArray(tags) ? tags.map((t: string) => t.toLowerCase().trim()) : [];

    if (severity !== undefined) {
      const sev = toEnum(Severity, severity, 'severity', res);
      if (!sev) return;
      data.severity = sev;
    }
    if (status !== undefined) {
      const stat = toEnum(Status, status, 'status', res);
      if (!stat) return;
      data.status = stat;
    }

    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data,
    });
    return res.json(incident);
  } catch (err) {
    console.error('[incidents/PATCH]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE /incidents/:id ────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.incident.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Incident not found' });

    await prisma.incident.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    console.error('[incidents/DELETE]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
