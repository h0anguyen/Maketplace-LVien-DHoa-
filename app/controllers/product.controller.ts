import prisma from "@models";
import { Request, Response } from "express";
import _ from "lodash";
import { ApplicationController } from ".";

const moment = require("moment-timezone");

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

    const user = await prisma.user.findFirst({
      where: {
        id: req.session.userId,
      },
    });

    const product = await prisma.products.findUnique({
      where: {
        id: +id,
      },
      include: {
        categories: true,
        user: {
          include: {
            roleUsers: true,
          },
        },
      },
    });
    const productsByCate = await prisma.products.findMany({
      where: {
        categoryId: 1,
      },
      orderBy: {
        id: "asc",
      },
    });
    productsByCate.shift();
    const shuffledProducts = _.shuffle(productsByCate);
    const productsCate = shuffledProducts.slice(0, 20);

    const contproduct = await prisma.products.count({
      where: {
        userId: product?.userId,
      },
    });
    const time = moment
      .tz(
        product?.user.createdAt,
        "ddd MMM DD YYYY HH:mm:ss ZZ",
        "Asia/Ho_Chi_Minh"
      )
      .format("YYYY-MM-DD");

    const reviews = await prisma.comments.findMany({
      where: {
        productId: parseInt(id),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        mainContent: true,
        content: true,
        star: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    res.render("userview/products.view/show", {
      product,
      contproduct,
      time,
      productsCate,
      user,
      reviews,
    });
  }
  public async search(req: Request, res: Response) {
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
    const categories = await prisma.categories.findMany();
    res.render("userview/products.view/search", {
      products,
      user,
      searchQuery: q,
      categories,
    });
  }

  public async shopView(req: Request, res: Response) {
    let user = null;
    let groups = null;

    if (req.session.userId) {
      groups = await prisma.participants.findMany({
        where: {
          userId: req.session.userId,
        },
        include: {
          groud: true,
        },
      });
      user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
    }
    const { id } = req.params;
    const userShop = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
      },
    });
    const productsShop = await prisma.products.findMany({
      where: {
        userId: +id,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 30,
    });
    const time = moment
      .tz(
        userShop?.createdAt,
        "ddd MMM DD YYYY HH:mm:ss ZZ",
        "Asia/Ho_Chi_Minh"
      )
      .format("DD-MM-YYYY");
    res.render("userview/shop.view/index", {
      userShop,
      productsShop,
      time,
      user,
      groups,
    });
  }

  public async addReview(req: Request, res: Response) {
    try {
      const { productId, orderId, rating, reviewTitle, reviewContent } =
        req.body;
      const userId = req.session.userId;
      console.log(req.body);

      const newReview = await prisma.comments.create({
        data: {
          mainContent: reviewTitle,
          content: reviewContent,
          star: parseInt(rating),
          productId: parseInt(productId),
          userId: userId,
        },
      });

      await prisma.orderDetail.updateMany({
        where: {
          orderId: parseInt(orderId),
          productId: parseInt(productId),
        },
        data: {
          hasReview: true,
        },
      });

      req.flash("success", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/user/purchase");
    } catch (error) {
      console.error("Error submitting review:", error);
      req.flash("error", "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.");
      res.redirect("/user/purchase");
    }
  }

  public async getMoreProductsV2(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.q as string;

    try {
        let whereClause = {};
        if (searchQuery) {
            whereClause = {
                OR: [
                    { productName: { contains: searchQuery, mode: 'insensitive' } },
                    { description: { contains: searchQuery, mode: 'insensitive' } }
                ]
            };
        }

        const products = await prisma.products.findMany({
            where: whereClause,
            skip: skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                productName: true,
                price: true,
                sold: true,
                categories: true,
                mainImage: true
            }
        });


        res.json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ products: [], error: 'Internal server error' });
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
}
