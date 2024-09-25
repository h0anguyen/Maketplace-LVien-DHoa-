import prisma from "@models";
import Decimal from "decimal.js";
import { Request, Response } from "express";
import { ApplicationController } from ".";
// checkout
export class OrderController extends ApplicationController {
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
      res.render("userview/order.view/index", { carts, user });
    }
  }
  public async create(req: Request, res: Response) {
    const userId = req.session.userId;
    const {
      recipientName,
      recipientAddress,
      recipientNumberPhone,
      promotionCode,
    } = req.body;

    const cart = await prisma.cart.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cart.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const order = await prisma.orders.create({
      data: {
        userId,
        recipientName,
        recipientAddress,
        recipientNumberPhone,
        status: 0,
      },
    });

    const orderDetails = await prisma.orderDetail.createMany({
      data: cart.map((item) => ({
        orderId: order.id,
        quantity: item.quantity,
        unitPrice: new Decimal(item.product.price).mul(item.quantity),
        productId: item.productId,
        promotionCode: promotionCode ? promotionCode : 1,
      })),
    });

    await prisma.cart.deleteMany({ where: { userId } });

    const createdOrderDetails = await prisma.orderDetail.findMany({
      where: { orderId: order.id },
      include: { product: true },
    });

    // res.status(201).json({
    //   message: "Đặt hàng thành công",
    //   orderId: order.id,
    //   orderDetails: createdOrderDetails,
    // });
    res.redirect("//purchase");
  }
}
