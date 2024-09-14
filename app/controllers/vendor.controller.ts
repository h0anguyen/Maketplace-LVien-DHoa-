import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import * as yup from "yup";
import { ApplicationController } from ".";
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const moment = require("moment");

export class VendorController extends ApplicationController {
  public async index(req: Request, res: Response) {
    if (req.session.userId) {
      const checkRole = await prisma.roleUser.findFirst({
        where: {
          AND: [{ userId: req.session.userId }, { rolesId: 2 }],
        },
      });
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      if (checkRole) {
        res.render("userview/vendor.view/index", { user });
      } else {
        res.render("userview/vendor.view/new", { user });
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signup");
    }
  }
  public async create(req: Request, res: Response) {
    const { fullName, address, numberPhone, email } = req.body;
    const id = req.session.userId;
    if (id) {
      const datacheck = {
        fullName,
        address,
        numberPhone,
        email,
      };
      const checkValSignup = yup.object({
        fullName: yup
          .string()
          .trim()
          .min(5, "Full name must be more than 5 characters.")
          .max(50, "Full name cannot exceed 50 characters"),
      });

      try {
        const check = await checkValSignup.validate(datacheck);

        const vendorInfor = await prisma.user.update({
          where: {
            id: req.session.userId,
          },
          data: {
            numberPhone: numberPhone,
            email: email,
            address: address,
            fullName: fullName,
          },
        });
        const addrole = await prisma.roleUser.create({
          data: {
            userId: id,
            rolesId: 2,
          },
        });
        req.flash("success", {
          msg: "Bạn đã trở thành người bán!",
        });
        res.redirect("/vendor");
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          req.flash("errors", { msg: error.errors });
          res.redirect("/vendor");
        } else {
          req.flash("errors", { msg: "lỗi không xác định" });
          res.redirect("/vendor");
        }
      }
    } else {
    }
  }
  public async vieworders(req: Request, res: Response) {
    // req.session.userId = 2;

    if (req.session.userId) {
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      const orders = await prisma.orders.findMany({
        where: {
          OrdersDetail: {
            some: {
              product: {
                userId: req.session.userId, // Assuming you want products belonging to user ID 2
              },
            },
          },
        },
        include: {
          OrdersDetail: {
            include: {
              product: true,
            },
          },
        },
      });
      res.render("userview/vendor.view/managerorder", { orders, user });
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signup");
    }
  }
  public async destroy(req: Request, res: Response) {}
}
