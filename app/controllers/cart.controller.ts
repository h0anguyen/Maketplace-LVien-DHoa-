import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";

export class CartController extends ApplicationController {
  public async index(req: Request, res: Response) {
    req.session.userId = 1;
    if (req.session.userId) {
      const carts = await prisma.cart.findMany({
        where: {
          userId: req.session.userId,
        },
        include: {
          product: true,
        },
      });
      const user = req.session.id;
      res.render("userview/cart.view/index", { carts, user });
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signin");
    }
  }

  public async create(req: Request, res: Response) {
    if (req.session.userId) {
      const { productId, quantity } = req.body;
      const userId = req.session.userId;

      await prisma.cart.upsert({
        where: {
          userId_productId: {
            userId: userId,
            productId: parseInt(productId),
          },
        },
        update: {
          quantity: {
            increment: parseInt(quantity),
          },
        },
        create: {
          userId: userId,
          productId: parseInt(productId),
          quantity: parseInt(quantity),
        },
      });

      req.flash("success", { msg: "Product added or updated in cart" });
      res.redirect("/");
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signin");
    }
  }

  public async handleCartActions(req: Request, res: Response) {
    const userId = req.session.userId;
    const { action, productId, quantity } = req.body;
    console.log("Request body:", req.body);

    if (action === "update") {
      const updates = productId.map((id: string, index: number) => {
        return prisma.cart.updateMany({
          where: {
            userId: userId,
            productId: parseInt(id),
          },
          data: {
            quantity: parseInt(quantity[index]),
          },
        });
      });

      await Promise.all(updates);

      req.flash("success", { msg: "Số lượng sản phẩm đã được cập nhật" });
    } else if (action === "remove") {
      const productIdToRemove = Array.isArray(productId)
        ? productId[0]
        : productId;

      await prisma.cart.deleteMany({
        where: {
          userId: userId,
          productId: parseInt(productIdToRemove),
        },
      });
      req.flash("success", { msg: "Sản phẩm đã được xóa khỏi giỏ hàng" });
    } else {
      req.flash("error", { msg: "Hành động không hợp lệ" });
    }
    res.redirect("/cart");
  }
}
