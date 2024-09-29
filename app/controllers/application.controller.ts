import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

export class ApplicationController {
  public async validateSignUp(req: Request, res: Response, next: NextFunction) {
    const { numberPhone, email } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ numberPhone: numberPhone.trim() }, { email: email.trim() }],
      },
    });

    if (existingUser) {
      req.flash("errors", {
        msg: "Số điện thoại hoặc email đã được đăng kí từ trước",
      });
      return res.redirect("/auth/signup");
    }
    next();
  }

  public async isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    return next();
  }

  return res.redirect('/auth/signin');
};

  public verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["x-access-token"] as string;

    if (!token) {
      return res.status(403).json({
        message: "Forbidden! Requires a token to access.",
      });
    }
  }
  public async checkBan(req: Request, res: Response, next: NextFunction) {
    const checkBan = await prisma.roleUser.findFirst({
      where: {
        AND: [
          {
            userId: req.session.userId,
          },
          {
            OR: [
              {
                rolesId: 1,
              },
              {
                rolesId: 0,
              },
            ],
          },
        ],
      },
    });
    if (checkBan == null) {
      req.flash("errors", { msg: "Tài khoản của bạn đã bị khóa" });
      return res.redirect("/auth/signin");
    } else {
      next();
    }
  }
}
