import { convertFileToBase64 } from "@configs/fileUpload";
import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";
const bcrypt = require("bcrypt");

export class VendorProductController extends ApplicationController {
  public async index(req: Request, res: Response) {
    if (req.session.userId) {
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      const products = await prisma.products.findMany({
        where: {
          userId: req.session.userId,
        },
        include: {
          categories: true,
        },
      });
      res.render("userview/vendor.view/index", { user, products });
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signin");
    }
  }

  public async new(req: Request, res: Response) {
    req.session.userId = 1;
    if (req.session.userId) {
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      const categories = await prisma.categories.findMany();
      res.render("userview/vendor.view/addproduct", { user, categories });
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signin");
    }
  }

  public async create(req: Request, res: Response) {
    const { productName, price, categoryId, description, inventory } = req.body;
    try {
      let fileimage: Buffer[] = [];
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => {
          fileimage.push(convertFileToBase64(file));
        });
      }
      const mainImage = fileimage[0];
      const newProduct = await prisma.products.create({
        data: {
          productName,
          price,
          categoryId: 1,
          description,
          inventory: parseInt(inventory),
          view: 0,
          sold: 0,
          mainImage,
          userId: req.session.userId,
        },
      });
      const getProductId = await prisma.products.findFirst({
        where: {
          userId: req.session.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      if (getProductId) {
        if (fileimage[1]) {
          const editImage1 = await prisma.images.create({
            data: {
              productId: getProductId.id,
              imageAddress: fileimage[1],
            },
          });
        }
        if (fileimage[2]) {
          const editImage2 = await prisma.images.create({
            data: {
              productId: getProductId.id,
              imageAddress: fileimage[2],
            },
          });
        }
        if (fileimage[3]) {
          const editImage3 = await prisma.images.create({
            data: {
              productId: getProductId.id,
              imageAddress: fileimage[3],
            },
          });
        }
      }
      if (newProduct) {
        req.flash("success", {
          msg: "Thêm sản phẩm thành công",
        });
        res.redirect("/vendorproduct");
      } else {
        req.flash("errors", {
          msg: "Lỗi không xác định",
        });
        res.redirect("/vendorproduct");
      }
    } catch (error) {
      req.flash("errors", {
        msg: "Lỗi không xác định! Thử lại sau",
      });
      res.redirect("/vendorproduct");
    }
  }

  public async edit(req: Request, res: Response) {
    const { id } = req.params;
    if (id) {
      const product = await prisma.products.findFirst({
        where: {
          id: parseInt(id),
        },
        include: {
          image: {
            orderBy: {
              id: "asc",
            },
          },
        },
      });
      const categories = await prisma.categories.findMany();

      res.render("userview/vendor.view/editproduct", { product, categories });
    }
  }

  public async update(req: Request, res: Response) {
    const { productName, price, categoryId, description, inventory } = req.body;
    const { id } = req.params;

    let fileimage: Buffer[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        fileimage.push(convertFileToBase64(file));
      });
    }

    if (fileimage.length > 0) {
      const mainImage = fileimage[0];
      const newProduct = await prisma.products.update({
        where: {
          id: parseInt(id),
        },
        data: {
          productName,
          price,
          categoryId: parseInt(categoryId),
          description,
          inventory: parseInt(inventory),
          view: 0,
          sold: 0,
          mainImage,
          userId: req.session.userId,
        },
      });
      const editImage1 = await prisma.images.updateMany({
        where: {
          AND: [{ productId: parseInt(id) }, { location: 1 }],
        },
        data: {
          imageAddress: fileimage[1],
        },
      });
      const editImage2 = await prisma.images.updateMany({
        where: {
          AND: [{ productId: parseInt(id) }, { location: 2 }],
        },
        data: {
          imageAddress: fileimage[2],
        },
      });
      const editImage3 = await prisma.images.updateMany({
        where: {
          AND: [{ productId: parseInt(id) }, { location: 3 }],
        },
        data: {
          imageAddress: fileimage[1],
        },
      });
      if (newProduct) {
        req.flash("success", {
          msg: "Cập nhật sản phẩm thành công",
        });
        res.redirect("/vendorproduct");
      } else {
        req.flash("errors", {
          msg: "Lỗi không xác định",
        });
        res.redirect("/vendorproduct");
      }
    } else {
      const newProduct = await prisma.products.update({
        where: {
          id: parseInt(id),
        },
        data: {
          productName,
          price,
          categoryId: parseInt(categoryId),
          description,
          inventory: parseInt(inventory),
        },
      });
      if (newProduct) {
        req.flash("success", {
          msg: "Cập nhật sản phẩm thành công",
        });
        res.redirect("/vendorproduct");
      } else {
        req.flash("errors", {
          msg: "Lỗi không xác định",
        });
        res.redirect("/vendorproduct");
      }
    }
  }

  public async destroy(req: Request, res: Response) {
    const { id } = req.params;
    const deleteCart = await prisma.cart.deleteMany({
      where: {
        productId: parseInt(id),
      },
    });
    const deleteComments = await prisma.comments.deleteMany({
      where: {
        productId: parseInt(id),
      },
    });
    const deleteImages = await prisma.images.deleteMany({
      where: {
        productId: parseInt(id),
      },
    });
    const deleteOrderDetail = await prisma.orderDetail.deleteMany({
      where: {
        productId: parseInt(id),
      },
    });
    const deleteProduct = await prisma.products.deleteMany({
      where: {
        id: parseInt(id),
      },
    });
    if (deleteProduct) {
      req.flash("success", {
        msg: "Xóa thành công",
      });
      res.redirect("/vendorproduct");
    } else {
      req.flash("errors", {
        msg: "Xóa thất bại",
      });
      res.redirect("/vendorproduct");
    }
  }
}
