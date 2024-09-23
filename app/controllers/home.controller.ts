import prisma from "@models";
import { Request, Response } from "express";
import _ from "lodash";
import { ApplicationController } from ".";

export class HomeController extends ApplicationController {
  public async index(req: Request, res: Response) {
    try {
      let user = null;
      if (req.session.userId) {
        user = await prisma.user.findFirst({
          where: {
            id: req.session.userId,
          },
        });
      }
      const productsDatabase = await prisma.products.findMany();
      const shuffledProducts = _.shuffle(productsDatabase);
      const products = shuffledProducts.slice(0, 45);

      const productsSold = await prisma.products.findMany({
        orderBy: {
          sold: "desc",
        },
        take: 100,
      });
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
      });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi khi xử lý yêu cầu" });
    }
  }
}
