import { ROLES } from "../config/constants.js";
import { AppError } from "../shared/errors/AppError.js";

export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    const userRoles = req.user?.roles || [];

    if (userRoles.includes(ROLES.SUPER_USUARIO)) {
      next();
      return;
    }

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      next(new AppError("Acceso denegado", 403, "El rol del usuario no permite acceder a este recurso"));
      return;
    }

    next();
  };
}
