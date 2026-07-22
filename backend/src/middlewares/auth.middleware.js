import { prisma } from "../database/prisma.js";
import { AppError } from "../shared/errors/AppError.js";
import { verifyAccessToken } from "../shared/utils/token.js";

export async function authRequired(req, _res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("Token requerido", 401, "Envie Authorization: Bearer {token}");
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        isActive: true,
        isDeleted: false
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError("Sesion no valida", 401, "El usuario del token no existe o esta inactivo");
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map((userRole) => userRole.role.name)
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new AppError("Token no valido", 401, error.message));
      return;
    }

    next(error);
  }
}
