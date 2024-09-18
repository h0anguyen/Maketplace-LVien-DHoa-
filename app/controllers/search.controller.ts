import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";

export class SearchController extends ApplicationController {
  public async index(req: Request, res: Response) {
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
    console.log(q);

    res.render("userview/products.view/search", {
      products,
      user,
      searchQuery: q,
    });
  }
}
