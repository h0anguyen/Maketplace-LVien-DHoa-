import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";

export class CartController extends ApplicationController {
  public async index(req: Request, res: Response) {
    let user = null;
    let groups = null;

    if (req.session.userId) {
      user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      groups = await prisma.participants.findMany({
        where: {
          userId: req.session.userId,
        },
        include: {
          groud: true,
        },
      });
    }
    if (req.session.userId) {
      const carts = await prisma.cart.findMany({
        where: {
          userId: req.session.userId,
        },
        include: {
          product: true,
        },
      });
      res.render("userview/cart.view/index", { carts, user, groups });
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
      res.redirect("back");
    }
  }
  //   public async handleCartActions(req: Request, res: Response) {
  //     const userId = req.session.userId;
  //     let { action, productId, quantity } = req.body;
  //     console.log(productId);

  //     productId = Array.isArray(productId) ? productId : [productId];
  //     console.log(productId);

  //     try {
  //         if (action === "update") {
  //             const updates = productId.map((id: string, index: number) => {
  //                 return prisma.cart.updateMany({
  //                     where: {
  //                         userId: userId,
  //                         productId: parseInt(id),
  //                     },
  //                     data: {
  //                         quantity: Array.isArray(quantity) ? parseInt(quantity[index]) : parseInt(quantity),
  //                     },
  //                 });
  //             });

  //             await Promise.all(updates);

  //             req.flash("success", { msg: "Số lượng sản phẩm đã được cập nhật" });
  //         } else if (action === "remove") {
  //             const deletions = productId.map((id: string) => {
  //                 return prisma.cart.delete({
  //                     where: {
  //                       userId_productId: {
  //                         userId: userId,
  //                         productId: parseInt(id),
  //                     },
  //                     },
  //                 });
  //             });

  //             await Promise.all(deletions);

  //             req.flash("success", { msg: productId.length > 1 ? "Các sản phẩm đã được xóa khỏi giỏ hàng" : "Sản phẩm đã được xóa khỏi giỏ hàng" });
  //         } else {
  //             req.flash("error", { msg: "Hành động không hợp lệ" });
  //         }
  //     } catch (error) {
  //         console.error("Error handling cart action:", error);
  //         req.flash("error", { msg: "Đã xảy ra lỗi khi xử lý giỏ hàng" });
  //     }

  //     res.redirect("/cart");
  // }
  public async update(req: Request, res: Response) {
    const userId = req.session.userId;
    const { productId, quantity } = req.body;

    try {
      productId.shift();
      const productIds = Array.isArray(productId) ? productId : [productId];
      const quantities = Array.isArray(quantity) ? quantity : [quantity];

      for (let i = 0; i < productId.length; i++) {
        await prisma.cart.updateMany({
          where: {
            userId: userId,
            productId: parseInt(productIds[i]),
          },
          data: {
            quantity: parseInt(quantities[i]),
          },
        });
      }

      res.redirect("/cart");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while updating the cart");
    }
  }

  public async remove(req: Request, res: Response) {
    const userId = req.session.userId;
    const { productId } = req.body;

    try {
      await prisma.cart.deleteMany({
        where: {
          userId: userId,
          productId: parseInt(productId),
        },
      });

      res.redirect("/cart");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send("An error occurred while removing the item from the cart");
    }
  }
}
