import prisma from "@models";
import { Request, Response } from "express";
import _ from "lodash";
import { ApplicationController } from ".";
const moment = require("moment-timezone");

export class HomeController extends ApplicationController {
  public async index(req: Request, res: Response) {
    let user = null;
    if (req.session.userId) {
      user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
    }
    const productsDatabase = await prisma.products.findMany({
      orderBy: {
        id: "asc",
      },
    });
    productsDatabase.shift();
    const shuffledProducts = _.shuffle(productsDatabase);
    const products = shuffledProducts.slice(0, 50);

    const productsSold = await prisma.products.findMany({
      take: 30,
    });

    const banners = await prisma.images.findMany({
      where: {
        bannerId: {
          not: null,
        },
      },
      orderBy: {
        bannerId: "asc",
      },
    });

    res.render("userview/home.view/index", {
      products,
      user,
      productsSold,
      banners,
    });
  }
}
