import env from "@configs/env";
import prisma from "@models";
import axios from "axios";
import { Request, Response } from "express";
import { ApplicationController } from ".";
const bcrypt = require("bcrypt");

export class AuthController extends ApplicationController {
  public async loginWithGoogle(req: Request, res: Response) {
    res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.googleClientId}&redirect_uri=${env.googleRedirectUri}&response_type=code&scope=profile email`
    );
  }

  public async loginWithGoogleRedirect(req: Request, res: Response) {
    const { code } = req.query;
    const {
      data: { access_token },
    } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      code,
      redirect_uri: env.googleRedirectUri,
      grant_type: "authorization_code",
    });

    const { data: googleUser } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const loginUser = await prisma.user.findFirst({
      where: {
        email: googleUser.email,
      },
    });

    if (!loginUser) {
      const newUser = await prisma.user.create({
        data: {
          numberPhone: googleUser.numberPhone,
          fullName: googleUser.name,
          email: googleUser.email,
          avatar: null,
          password: null,
          roleUsers: {
            create: [
              {
                rolesId: 1,
              },
            ],
          },
        },
      });

      req.session.userId = newUser.id;
    } else {
      await prisma.user.update({
        where: {
          id: loginUser.id,
        },
        data: {
          fullName: googleUser.name,
          email: googleUser.email,
          avatar: null,
        },
      });

      req.session.userId = loginUser.id;
    }

    req.flash("success", { msg: "Login successfully" });

    res.redirect("/");
  }

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
