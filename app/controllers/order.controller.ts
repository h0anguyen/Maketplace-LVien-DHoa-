import prisma from "@models";
import Decimal from "decimal.js";
import { Request, Response } from "express";
import subVn from "sub-vn";
import { ApplicationController } from ".";
// checkout
export class OrderController extends ApplicationController {
  public async getDistricts(req: Request, res: Response) {
    const { provinceCode } = req.query;
    if (!provinceCode) {
      return res.status(400).json({ message: "Province code is required" });
    }

    try {
      const districts = subVn.getDistrictsByProvinceCode(provinceCode);

      if (!districts) {
        return res.status(404).json({ message: "Districts not found" });
      }
      res.json(districts);
    } catch (error) {
      console.error("Error fetching districts from API:", error);
      res.status(500).json({ message: "Error fetching districts" });
    }
  }

  public async getWards(req: Request, res: Response) {
    const { districtCode } = req.query;
    if (!districtCode) {
      return res.status(400).json({ message: "District code is required" });
    }

    try {
      const wards = subVn.getWardsByDistrictCode(districtCode);

      if (!wards) {
        return res.status(404).json({ message: "Wards not found" });
      }
      res.json(wards);
    } catch (error) {
      console.error("Error fetching wards from API:", error);
      res.status(500).json({ message: "Error fetching wards" });
    }
  }

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

      const provinces = subVn.getProvinces();

      res.render("userview/order.view/index", {
        user,
        carts,
        groups,
        provinces,
      });
    }
  }
  public async create(req: Request, res: Response) {
    const userId = req.session.userId;
    const {
      recipientName,
      recipientAddress,
      recipientNumberPhone,
      province,
      district,
      ward,
      paymentMethod,
    } = req.body;

    const MainAddress = subVn.getWardsByCode(ward);

    const fullAddress = `${recipientAddress}, ${MainAddress.name}, ${MainAddress.district_name}, ${MainAddress.province_name}`;

    const cart = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: true,
        user: {
          select: { email: true },
        },
      },
    });
    if (cart.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const order = await prisma.orders.create({
      data: {
        userId,
        recipientName,
        recipientAddress: fullAddress,
        recipientNumberPhone,
        status: "PENDING",
      },
    });

    await prisma.orderDetail.createMany({
      data: cart.map((item) => ({
        orderId: order.id,
        quantity: item.quantity,
        unitPrice: new Decimal(item.product.price).mul(item.quantity),
        productId: item.productId,
      })),
    });

    for (const item of cart) {
      await prisma.products.update({
        where: { id: item.productId },
        data: {
          inventory: {
            decrement: item.quantity,
          },
          sold: {
            increment: item.quantity,
          },
        },
      });
    }

    const totalAmount = cart.reduce(
      (total, item) =>
        total + new Decimal(item.product.price).mul(item.quantity).toNumber(),
      0
    );

    await prisma.cart.deleteMany({ where: { userId } });

    if (paymentMethod === "cod") {
      return res.render("userview/order.view/success");
    } else if (paymentMethod === "vnpay") {
      return res.render("userview/order.view/payment", {
        orderId: order.id,
        totalAmount,
      });
    }
  }
}
