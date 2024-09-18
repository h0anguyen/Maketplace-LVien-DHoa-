import { Request, Response } from "express";
import { ApplicationController } from ".";

import prisma from "@models";

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
      const products = await prisma.products.findMany({
        orderBy: {
          id: "desc",
        },
        take: 18,
      });

      res.render("userview/home.view/index", { products, user });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi khi xử lý yêu cầu" });
    }
  }
}
