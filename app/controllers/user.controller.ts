import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import * as yup from "yup";
import { ApplicationController } from ".";

const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

export class UserController extends ApplicationController {
  public async index(req: Request, res: Response) {}

  public async create(req: Request, res: Response) {
    const { fullName, email, numberPhone, password, confirmPassword } =
      req.body;

    const data = {
      fullName,
      numberPhone,
      password,
    };
    if (password.trim() != confirmPassword.trim()) {
      req.flash("errors", { msg: "Xác nhận mật khẩu không giống" });
      return res.redirect("/auth/signup");
    }

    const checkValSignup = yup.object({
      fullName: yup
        .string()
        .trim()
        .min(5, "Tên của bạn phải lớn hơn 5 kí tự")
        .max(50, "Tên của bạn phải nhỏ hơn 50 kí tự"),
      numberPhone: yup.string().trim(),
      password: yup
        .string()
        .trim()
        .min(6, "Password phải lớn hơn 6 kí tự")
        .max(30, "Password phải nhỏ hơn 30 kí tự"),
    });

    try {
      const check = await checkValSignup.validate(data);

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      const newUser = await prisma.user.create({
        data: {
          numberPhone: numberPhone,
          email: email,
          password: hash,
          address: null,
          avatar: null,
          birthday: null,
          fullName: fullName,
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

      req.flash("success", { msg: "Đăng nhập thành công!" });
      res.redirect("/");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        req.flash("errors", { msg: error.errors });
        res.redirect("/auth/signup");
      } else {
        req.flash("errors", { msg: "Lỗi không xác định" });
        res.redirect("/auth/signup");
      }
    }
  }

  public async destroy(req: Request, res: Response) {}
}
