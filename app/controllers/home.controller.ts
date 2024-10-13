import prisma from "@models";
import { Request, Response } from "express";
import _ from "lodash";
import { ApplicationController } from ".";
const moment = require("moment-timezone");

export class HomeController extends ApplicationController {
  public async index(req: Request, res: Response) {
    let user = null;
    let groups = null;
    req.session.userId = 31;

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
      groups,
    });
  }
  public async getMoreProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
  
    const products = await prisma.products.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        categories: true
      }
    });
  
    res.json(products);
  }
}
