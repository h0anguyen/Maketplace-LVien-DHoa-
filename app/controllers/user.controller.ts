import { convertFileToBase64 } from "@configs/fileUpload";
import prisma from "@models";
import { Request, Response } from "express";
import * as yup from "yup";
import { ApplicationController } from ".";
const bcrypt = require("bcrypt");

export class UserController extends ApplicationController {
  public async index(req: Request, res: Response) {
    let groups = null;

    if (req.session.userId) {
      groups = await prisma.participants.findMany({
        where: {
          userId: req.session.userId,
        },
        include: {
          groud: true,
        },
      });
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      res.render("userview/profile.view/index", { user, groups });
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signup");
    }
  }

  public async purchase(req: Request, res: Response) {
    const userId = req.session.userId;
    let groups = null;

    if (req.session.userId) {
      groups = await prisma.participants.findMany({
        where: {
          userId: req.session.userId,
        },
        include: {
          groud: true,
        },
      });
    }
    const user = await prisma.user.findFirst({
      where: {
        id: req.session.userId,
      },
    });
    const orders = await prisma.orders.findMany({
      where: { userId: userId },
      include: {
        OrdersDetail: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.render("userview/profile.view/purchase", { orders, user,groups });
  }

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
          avatar: undefined,
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
  public async update(req: Request, res: Response) {
    const { fullName, numberPhone, email, address } = req.body;
    const file = req.file ? convertFileToBase64(req.file) : null;
    const data = {
      fullName,
      numberPhone,
    };

    const checkValSignup = yup.object({
      fullName: yup
        .string()
        .trim()
        .min(5, "Tên của bạn phải lớn hơn 5 kí tự")
        .max(50, "Tên của bạn phải nhỏ hơn 50 kí tự"),
      numberPhone: yup.string().trim(),
    });

    try {
      const check = await checkValSignup.validate(data);
      if (file) {
        const updateuser = await prisma.user.update({
          where: { id: req.session.userId },
          data: {
            fullName: fullName,
            numberPhone: numberPhone,
            email: email,
            address: address || null,
            avatar: file,
          },
        });
        req.flash("success", { msg: "Cập nhật thành công" });
        res.redirect("/user");
      } else {
        const updateuser = await prisma.user.update({
          where: { id: req.session.userId },
          data: {
            fullName: fullName,
            numberPhone: numberPhone,
            email: email,
            address: address || null,
          },
        });
        req.flash("success", { msg: "Cập nhật thành công" });
        res.redirect("/user");
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        req.flash("errors", { msg: error.errors });
        res.redirect("/user");
      } else {
        req.flash("errors", { msg: "Lỗi không xác định thử lại sau" });
        res.redirect("/user");
      }
    }
  }
  public async editPassword(req: Request, res: Response) {
    if (req.session.userId) {
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      res.render("userview/profile.view/editPassword", { user });
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signup");
    }
  }
  public async changePassword(req: Request, res: Response) {
    const { password, newPassword, c_password } = req.body;
    if (req.session.userId) {
      const checkUser = await prisma.user.findFirst({
        where: {
          AND: [{ id: req.session.userId }, { password: { not: null } }],
        },
      });
      if (checkUser) {
        if (await bcrypt.compare(password, checkUser.password)) {
          const data = {
            newPassword,
          };
          if (newPassword.trim() != c_password.trim()) {
            req.flash("errors", { msg: "Xác nhận mật khẩu không giống" });
            return res.redirect("/user/editPassword");
          }
          const checkValSignup = yup.object({
            password: yup
              .string()
              .trim()
              .min(6, "Password phải lớn hơn 6 kí tự")
              .max(30, "Password phải nhỏ hơn 30 kí tự"),
          });
          try {
            const check = await checkValSignup.validate(data);

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(newPassword, salt);

            const newUser = await prisma.user.update({
              where: { id: req.session.userId },
              data: {
                password: hash,
              },
            });

            req.flash("success", { msg: "Thay đổi mật khẩu thành công" });
            return res.redirect("/user");
          } catch (error) {
            if (error instanceof yup.ValidationError) {
              req.flash("errors", { msg: error.errors });
              return res.redirect("/user/editPassword");
            } else {
              req.flash("errors", { msg: "Lỗi không xác định" });
              return res.redirect("/user/editPassword");
            }
          }
        } else {
          req.flash("errors", {
            msg: "Mật khẩu hiện tại không chính xác",
          });
          return res.redirect("/user/editPassword");
        }
      } else {
        req.flash("errors", {
          msg: "Không thể thay đổi mật khẩu khi bạn đang sử dụng tài khoảng Google",
        });
        return res.redirect("/user");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signup");
    }
  }

  public async destroy(req: Request, res: Response) {}
}
