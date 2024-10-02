import prisma from "@models";
import axios from "axios";
import Decimal from "decimal.js";
import { Request, Response } from "express";
import { ApplicationController } from ".";
// checkout
export class OrderController extends ApplicationController {
  public async getDistricts(req: Request, res: Response) {
    const { provinceCode } = req.query;
    if (!provinceCode) {
      return res.status(400).json({ message: "Province code is required" });
    }

    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const districts = response.data.districts;
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
      const response = await axios.get(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const wards = response.data.wards;
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
    if (req.session.userId) {
      const carts = await prisma.cart.findMany({
        where: {
          userId: req.session.userId,
        },
        include: {
          product: true,
        },
      });

      const provincesResponse = await axios.get(
        "https://provinces.open-api.vn/api/p/"
      );
      const provinces = provincesResponse.data;

      const user = req.session.id;
      res.render("userview/order.view/index", { user, carts, provinces });
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

    const [provinceData, districtData, wardData] = await Promise.all([
      axios.get(`https://provinces.open-api.vn/api/p/${province}`),
      axios.get(`https://provinces.open-api.vn/api/d/${district}`),
      axios.get(`https://provinces.open-api.vn/api/w/${ward}`),
    ]);

    const provinceName = provinceData.data.name;
    const districtName = districtData.data.name;
    const wardName = wardData.data.name;

    const fullAddress = `${recipientAddress}, ${wardName}, ${districtName}, ${provinceName}`;

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
        recipientAddress: fullAddress,
        recipientNumberPhone,
        status: "PENDING",
      },
    });

    const orderDetail = await prisma.orderDetail.createMany({
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

    const totalAmount =
      cart.reduce(
        (total, item) =>
          total + new Decimal(item.product.price).mul(item.quantity).toNumber(),
        0
      ) * 100;

    // Xóa giỏ hàng trước khi redirect hoặc render
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
