const prisma = require('../utils/prisma');

function activityLogger(entityType, action) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const entityId = data?.id || req.params.id;
        if (entityId) {
          const changes = {};
          if (action === 'UPDATE' && req.body) {
            Object.keys(req.body).forEach(key => {
              if (req.body[key] !== undefined) {
                changes[key] = req.body[key];
              }
            });
          }

          prisma.auditLog.create({
            data: {
              action,
              entityType,
              entityId: parseInt(entityId) || 0,
              userId: req.user.id,
              changes: Object.keys(changes).length > 0 ? JSON.stringify(changes) : null,
              ipAddress: req.ip || req.connection?.remoteAddress
            }
          }).catch(err => console.error('Activity log error:', err));
        }
      }
      return originalJson(data);
    };

    next();
  };
}

module.exports = activityLogger;
