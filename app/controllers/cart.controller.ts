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
  public async update(req: Request, res: Response) {
    const userId = req.session.userId;
    const { productId, quantity } = req.body;

    try {
      if (productId.length > 1) {
        productId.shift();
      }
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
      res.status(500).send("An error occurred while updating the cart: error");
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
