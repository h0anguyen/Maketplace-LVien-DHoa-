import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";

export class CategoryController extends ApplicationController {
  public async show(req: Request, res: Response) {
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
        user,
        groups,
      });
    } catch (error) {
      console.error("Error fetching products by category ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  public async getMoreProductsByCategory(req: Request, res: Response) {
    try {
      const categoryId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const sortBy = (req.query.sortby as string) || "rating";

      if (isNaN(categoryId)) {
        return res.status(400).json({ error: "Invalid category ID" });
      }
      const sortOptions: any = {
        rating: { sold: "desc" },
        asc: { price: "asc" },
        desc: { price: "desc" },
      };

      const products = await prisma.products.findMany({
        where: {
          categoryId: categoryId,
        },
        skip,
        take: limit,
        orderBy: sortOptions[sortBy],
      });

      if (products.length === 0) {
        return res
          .status(404)
          .json({ message: "No more products found in this category" });
      }

      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
