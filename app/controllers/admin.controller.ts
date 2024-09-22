import prisma from "@models";
import { Request, Response } from "express";
const moment = require("moment-timezone");
export class AdminController {
  public async index(req: Request, res: Response) {
    if (req.session.userId != null) {
      const checkRole = await prisma.roleUser.findFirst({
        where: {
          userId: +req.session.userId,
          rolesId: 0,
        },
      });
      if (!checkRole) {
        req.flash("errors", {
          msg: "Không đủ vai trò để truy cập ",
        });
        return res.render("userview/auth.view/signin");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập ",
      });
      return res.render("userview/auth.view/signin");
    }
    try {
      const userId = req.session.userId;

      let data: number[] = [1];
      const ttUsers = await prisma.user.count({
        where: {
          roleUsers: {
            some: {
              rolesId: 1,
            },
          },
        },
      });
      const ttProducts = await prisma.products.count();
      res.render("adminview/admin.home.view/index", {
        userId,
        data,
        countUser: ttUsers,
        countProducts: ttProducts,
      });
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }

  public async listUsers(req: Request, res: Response) {
    if (req.session.userId != null) {
      console.log(req.session.userId);

      const checkRole = await prisma.roleUser.findFirst({
        where: {
          userId: +req.session.userId,
          rolesId: 0,
        },
      });
      if (!checkRole) {
        req.flash("errors", {
          msg: "Không đủ vai trò để truy cập ",
        });
        return res.render("userview/auth.view/signin");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập ",
      });
      return res.render("userview/auth.view/signin");
    }
    try {
      const userId = req.session.userId;

      const users = await prisma.user.findMany({
        include: {
          roleUsers: true,
        },
        orderBy: {
          id: "asc",
        },
      });
      users.shift();
      let array = [];
      for (let index = 0; index < users.length; index++) {
        array.push(
          moment
            .tz(
              users[index].updatedAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("YYYY-MM-DD")
        );
      }
      res.render("adminview/admin.manages.view/users", {
        userId,
        users,
        array,
      });
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }

  public async listProducts(req: Request, res: Response) {
    if (req.session.userId != null) {
      console.log(req.session.userId);

      const checkRole = await prisma.roleUser.findFirst({
        where: {
          userId: +req.session.userId,
          rolesId: 0,
        },
      });
      if (!checkRole) {
        req.flash("errors", {
          msg: "Không đủ vai trò để truy cập ",
        });
        return res.render("userview/auth.view/signin");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập ",
      });
      return res.render("userview/auth.view/signin");
    }
    try {
      const userId = req.session.userId;
      const products = await prisma.products.findMany({
        include: {
          categories: true,
        },
      });
      let array = [];
      for (let index = 0; index < products.length; index++) {
        array.push(
          moment
            .tz(
              products[index].updatedAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("YYYY-MM-DD")
        );
      }
      res.render("adminview/admin.manages.view/products", {
        userId,
        products,
        array,
      });
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const userId = 0;
      const { id } = req.params;
      const deleteUser = await prisma.roleUser.deleteMany({
        where: {
          userId: +id,
        },
      });
      const users = await prisma.user.findMany({
        include: {
          roleUsers: true,
        },
      });
      res.redirect("/admin/users");
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }
}
