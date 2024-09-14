import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ApplicationController } from ".";

const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

export class AuthController extends ApplicationController {
  public async signup(req: Request, res: Response) {
    res.render("userview/auth.view/signup");
  }

  public async signin(req: Request, res: Response) {
    res.render("userview/auth.view/signin");
  }

  public async login(req: Request, res: Response) {
    const { username, password } = req.body;

    const checkUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: username.trim() }, { numberPhone: username.trim() }],
      },
    });
    if (!checkUser) {
      req.flash("errors", { msg: "Không tìm thấy tên tài khoản của bạn." });
      res.redirect("/auth/signin");
    } else {
      if (checkUser.password) {
        if (await bcrypt.compare(password, checkUser.password)) {
          req.session.userId = checkUser.id;

          req.flash("success", { msg: "Đăng nhập thành công!" });
          res.redirect("/");
        } else {
          req.flash("errors", { msg: "Mật khẩu sai." });
          res.redirect("/auth/signin");
        }
      } else {
        req.flash("errors", { msg: "Lỗi khi tìm mật khẩu" });
        res.redirect("/auth/signin");
      }
    }
  }

  public async destroy(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        req.flash("errors", { msg: err });
        res.redirect("/");
      } else {
        res.redirect("/");
      }
    });
  }
}
