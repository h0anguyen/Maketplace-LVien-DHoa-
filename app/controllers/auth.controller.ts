import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { Op } from "sequelize";
import { ApplicationController } from ".";

const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

export class AuthController extends ApplicationController {
  public async signup(req: Request, res: Response) {
    res.render("userview/auth.view/signup");
  }

  public async login(req: Request, res: Response) {
    const { username, password } = req.body;

    const checkUser = await prisma.user.findFirst({
      where: {
        [Op.or]: [{ email: username.trim() }, { numberPhone: username.trim() }],
      },
    });
    if (!checkUser) {
      req.flash("errors", { msg: "Không tìm thấy tên tài khoản của bạn." });
      res.redirect("/auth/signin");
    } else {
      if (await bcrypt.compare(password, checkUser.password)) {
        req.session.userId = checkUser.id;

        req.flash("success", { msg: "Đăng nhập thành công!" });
        res.redirect("/");
      } else {
        req.flash("errors", { msg: "Mật khẩu sai." });
        res.redirect("/auth/signin");
      }
    }
  }
}
