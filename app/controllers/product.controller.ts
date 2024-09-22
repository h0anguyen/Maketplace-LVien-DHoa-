import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";

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
    const products = await prisma.products.findUnique({
      where: { id: +id },
    });
    if (!products) {
      return res.status(404).send("Product not found");
    }
    res.render("userview/products.view/show", { products });
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
    console.log(q);

    res.render("userview/products.view/search", {
      products,
      user,
      searchQuery: q,
    });
  }
}
