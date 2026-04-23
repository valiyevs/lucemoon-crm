const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { paginate, paginatedResponse } = require('../utils/pagination');

// GET /api/tasks - List all tasks (paginated)
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, assignedTo, leadId, quoteId, orderId } = req.query;
    const { page, limit, skip } = paginate(req.query);
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = parseInt(assignedTo);
    if (leadId) where.leadId = parseInt(leadId);
    if (quoteId) where.quoteId = parseInt(quoteId);
    if (orderId) where.orderId = parseInt(orderId);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          lead: { select: { id: true, title: true } },
          quote: { select: { id: true, quoteNumber: true } },
          order: { select: { id: true, orderNumber: true } },
          assignedUser: { select: { id: true, firstName: true, lastName: true } },
          creator: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
        skip,
        take: limit
      }),
      prisma.task.count({ where })
    ]);
    res.json(paginatedResponse(tasks, total, page, limit));
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create task
router.post('/',
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('leadId').optional().isInt(),
  body('quoteId').optional().isInt(),
  body('orderId').optional().isInt(),
  body('assignedTo').optional().isInt(),
  validate,
  async (req, res) => {
    try {
      const { title, description, priority, status, dueDate, leadId, quoteId, orderId, assignedTo } = req.body;

      const task = await prisma.task.create({
        data: {
          title,
          description,
          priority: priority || 'MEDIUM',
          status: status || 'PENDING',
          dueDate: dueDate ? new Date(dueDate) : null,
          leadId: leadId || null,
          quoteId: quoteId || null,
          orderId: orderId || null,
          assignedTo: assignedTo || null,
          createdBy: req.user.id
        },
        include: {
          lead: { select: { id: true, title: true } },
          quote: { select: { id: true, quoteNumber: true } },
          order: { select: { id: true, orderNumber: true } },
          assignedUser: { select: { id: true, firstName: true, lastName: true } },
          creator: { select: { id: true, firstName: true, lastName: true } }
        }
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'Task',
          entityId: task.id,
          userId: req.user.id,
          changes: JSON.stringify({ title, status, priority })
        }
      });

      res.status(201).json(task);
    } catch (err) {
      console.error('POST /api/tasks error:', err);
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid lead, quote, order or user ID' });
      }
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

// PUT /api/tasks/:id - Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, assignedTo } = req.body;
    const taskId = parseInt(req.params.id);

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) {
      data.status = status;
      if (status === 'COMPLETED') data.completedAt = new Date();
    }
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedTo !== undefined) data.assignedTo = assignedTo;

    const changes = {};
    if (title !== undefined && title !== existing.title) changes.title = { old: existing.title, new: title };
    if (status !== undefined && status !== existing.status) changes.status = { old: existing.status, new: status };
    if (priority !== undefined && priority !== existing.priority) changes.priority = { old: existing.priority, new: priority };

    const task = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        lead: { select: { id: true, title: true } },
        quote: { select: { id: true, quoteNumber: true } },
        order: { select: { id: true, orderNumber: true } },
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
        creator: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    // Audit log
    if (Object.keys(changes).length > 0) {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'Task',
          entityId: task.id,
          userId: req.user.id,
          changes: JSON.stringify(changes)
        }
      });
    }

    res.json(task);
  } catch (err) {
    console.error('PUT /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', auth, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    await prisma.task.delete({ where: { id: taskId } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Task',
        entityId: taskId,
        userId: req.user.id
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
