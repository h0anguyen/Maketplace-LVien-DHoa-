import prisma from "@models";
import { Request, Response } from "express";
import _ from "lodash";
import { ApplicationController } from ".";

const moment = require("moment-timezone");

export class ProductController extends ApplicationController {
  public async index(req: Request, res: Response) {
    const products = await prisma.products.findMany({
      take: 12,
      orderBy: {
        createdAt: "desc",
      },
    });
    res.render("userview/products.view/index", { products });
  }
  public async show(req: Request, res: Response) {
    const { id } = req.params;

    const product = await prisma.products.findUnique({
      where: {
        id: +id,
      },
      include: {
        categories: true,
        user: {
          include: {
            roleUsers: true,
          },
        },
      },
    });
    const productsByCate = await prisma.products.findMany({
      where: {
        categoryId: 1,
      },
      orderBy: {
        id: "asc",
      },
    });
    productsByCate.shift();
    const shuffledProducts = _.shuffle(productsByCate);
    const productsCate = shuffledProducts.slice(0, 20);

    const contproduct = await prisma.products.count({
      where: {
        userId: product?.userId,
      },
    });
    const time = moment
      .tz(
        product?.user.createdAt,
        "ddd MMM DD YYYY HH:mm:ss ZZ",
        "Asia/Ho_Chi_Minh"
      )
      .format("YYYY-MM-DD");

    res.render("userview/products.view/show", {
      product,
      contproduct,
      time,
      productsCate,
    });
  }
  public async Search(req: Request, res: Response) {
    let user = null;
    if (req.session.userId) {
      user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
    }
    const { q } = req.query;
    const products = await prisma.products.findMany({
      where: {
        productName: { contains: q as string },
      },
      orderBy: {
        productName: "asc",
      },
      take: 12,
    });
    const categories = await prisma.categories.findMany();
    res.render("userview/products.view/search", {
      products,
      user,
      searchQuery: q,
      categories,
    });
  }

  public async shopView(req: Request, res: Response) {
    const { id } = req.params;
    const userShop = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
      },
    });
    const productsShop = await prisma.products.findMany({
      where: {
        userId: +id,
      },
    });
    const time = moment
      .tz(
        userShop?.createdAt,
        "ddd MMM DD YYYY HH:mm:ss ZZ",
        "Asia/Ho_Chi_Minh"
      )
      .format("DD-MM-YYYY");
    res.render("userview/shop.view/index", { userShop, productsShop, time });
  }
}
