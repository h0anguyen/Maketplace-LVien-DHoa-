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
}
