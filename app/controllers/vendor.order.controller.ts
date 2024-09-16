import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";
const bcrypt = require("bcrypt");

export class VendorOrderController extends ApplicationController {
  public async index(req: Request, res: Response) {
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
                userId: req.session.userId,
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

  public async update(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const confirmOrder = await prisma.orders.update({
        where: { id: parseInt(id) },
        data: {
          status: 2,
        },
      });
      req.flash("success", { msg: "Xác nhận thành công" });
      res.redirect("/vendororder");
    } catch (error) {
      req.flash("errors", { msg: "Lỗi không xác định thử lại sau" });
      res.redirect("/vendororder");
    }
  }

  public async confirmOrder(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const confirmOrder = await prisma.orders.update({
        where: { id: parseInt(id) },
        data: {
          status: 2,
        },
      });
      req.flash("success", { msg: "Xác nhận thành công" });
      res.redirect("/vendororder");
    } catch (error) {
      req.flash("errors", { msg: "Lỗi không xác định thử lại sau" });
      res.redirect("/vendororder");
    }
  }

  public async cancelorder(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const cancelOrder = await prisma.orders.update({
        where: { id: parseInt(id) },
        data: {
          status: 0,
        },
      });
      req.flash("success", { msg: "Hủy đơn hàng thành công" });
      res.redirect("/vendororder");
    } catch (error) {
      req.flash("errors", { msg: "Lỗi không xác định thử lại sau" });
      res.redirect("/vendororder");
    }
  }

  public async destroy(req: Request, res: Response) {
    const { id } = req.params;

    const deleteOrderDetail = await prisma.orderDetail.deleteMany({
      where: {
        orderId: parseInt(id),
      },
    });
    const deleteOrder = await prisma.orders.deleteMany({
      where: {
        id: parseInt(id),
      },
    });

    if (deleteOrder) {
      req.flash("success", {
        msg: "Xóa order thành công",
      });
      res.redirect("/managerorder");
    } else {
      req.flash("errors", {
        msg: "Xóa thất bại",
      });
      res.redirect("/managerorder");
    }
  }

  public async show(req: Request, res: Response) {
    const { id } = req.params;

    const orderDetail = await prisma.orderDetail.findMany({
      where: {
        orderId: parseInt(id),
      },
    });
  }
}
