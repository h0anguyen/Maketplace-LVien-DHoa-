import prisma from "@models";
import { Request, Response } from "express";
import _ from "lodash";
import { ApplicationController } from ".";
const moment = require("moment-timezone");

export class HomeController extends ApplicationController {
  public async index(req: Request, res: Response) {
    // req.session.userId = 1;
    try {
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

      const productsDatabase = await prisma.products.findMany({
        orderBy: {
          id: "asc",
        },
      });
      productsDatabase.shift();
      const shuffledProducts = _.shuffle(productsDatabase);
      const products = shuffledProducts.slice(0, 60);

      const productsSold = await prisma.products.findMany({
        orderBy: {
          sold: "desc",
        },
        take: 70,
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
      console.log(groups);
      res.render("userview/home.view/index", {
        products,
        user,
        productsSold,
        banners,
        groups,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi xử lý yêu cầu", error });
    }
  }
}
