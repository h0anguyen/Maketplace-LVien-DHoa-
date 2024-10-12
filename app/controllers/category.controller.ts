import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";

export class CategoryController extends ApplicationController {
  public async show(req: Request, res: Response) {
    try {
      const categoryId = parseInt(req.params.id);

      const category = await prisma.categories.findUnique({
        where: { id: categoryId },
      });

      const products = await prisma.products.findMany({
        where: { categoryId },
        take: 20,
      });
      const categories = await prisma.categories.findMany();

      res.render("userview/categories.view/show", {
        products,
        categories,
        categoryId,
      });
    } catch (error) {
      console.error("Error fetching products by category ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  public async getMoreProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const products = await prisma.products.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        categories: true,
      },
    });

    res.json(products);
  }
  public async getMoreProductsV2(req: Request, res: Response) {
    const categoryId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    try {
      const products = await prisma.products.findMany({
        where: { categoryId: categoryId },
        skip: skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          productName: true,
          price: true,
          sold: true,
          categories: true,
          mainImage: true,
        },
      });


      res.json({ products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ products: [], error: "Internal server error" });
    }
  }
}
