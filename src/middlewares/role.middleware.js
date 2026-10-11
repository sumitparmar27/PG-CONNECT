const ApiError = require("../utils/ApiError");

function requirePermission(...permissions) {
  return function checkPermission(req, res, next) {
    const userPermissions = req.user?.permissions || [];
    const hasAll = permissions.every((permission) => userPermissions.includes(permission));
    if (!hasAll) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }
    next();
  };
}

function requireAnyPermission(...permissions) {
  return function checkAnyPermission(req, res, next) {
    const userPermissions = req.user?.permissions || [];
    const hasAny = permissions.some((permission) => userPermissions.includes(permission));
    if (!hasAny) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }
    next();
  };
}

module.exports = { requirePermission, requireAnyPermission };
