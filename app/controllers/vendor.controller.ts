import { convertFileToBase64 } from "@configs/fileUpload";
import prisma from "@models";
import { Request, Response } from "express";
import * as yup from "yup";
import { ApplicationController } from ".";
const bcrypt = require("bcrypt");
const moment = require("moment");
export class VendorController extends ApplicationController {
  public async index(req: Request, res: Response) {
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

      const checkRole = await prisma.roleUser.findFirst({
        where: {
          AND: [{ userId: req.session.userId }, { rolesId: 2 }],
        },
      });
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      const orders = await prisma.orders.findMany({
        where: {
          AND: [
            {
              OrdersDetail: {
                some: {
                  product: {
                    userId: req.session.userId,
                  },
                },
              },
            },
            { status: "PENDING" },
          ],
        },
        include: {
          OrdersDetail: {
            include: {
              product: true,
            },
          },
        },
      });
      const productsCount = await prisma.products.count({
        where: {
          userId: req.session.userId,
        },
      });
      let array = [];
      for (let index = 0; index < orders.length; index++) {
        array.push(
          moment
            .tz(orders[index].createdAt, "ddd MMM DD YYYY HH:mm:ss ZZ", "UTC")
            .format("DD-MM-YYYY HH:mm:ss")
        );
      }
      if (checkRole) {
        res.render("vendorview/vendor.view/index", {
          user,
          productsCount,
          orders,
          array,
          groups,
        });
      } else {
        res.render("vendorview/vendor.view/new", { user, groups });
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signup");
    }
  }
  public async new(req: Request, res: Response) {
    if (req.session.userId) {
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      res.render("vendorview/vendor.view/new", { user });
    }
  }
  public async create(req: Request, res: Response) {
    const { fullName, address, numberPhone, email } = req.body;
    const id = req.session.userId;
    if (id) {
      const datacheck = {
        fullName,
        address,
        numberPhone,
        email,
      };
      const checkValSignup = yup.object({
        fullName: yup
          .string()
          .trim()
          .min(5, "Full name must be more than 5 characters.")
          .max(50, "Full name cannot exceed 50 characters"),
      });

      try {
        const check = await checkValSignup.validate(datacheck);

        const vendorInfor = await prisma.user.update({
          where: {
            id: req.session.userId,
          },
          data: {
            numberPhone: numberPhone,
            email: email,
            address: address,
            fullName: fullName,
          },
        });
        const addrole = await prisma.roleUser.create({
          data: {
            userId: id,
            rolesId: 2,
          },
        });
        req.flash("success", {
          msg: "Bạn đã trở thành người bán!",
        });
        res.redirect("/vendor");
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          req.flash("errors", { msg: error.errors });
          res.redirect("/vendor");
        } else {
          req.flash("errors", { msg: "lỗi không xác định" });
          res.redirect("/vendor");
        }
      }
    } else {
    }
  }

  public async listOrder(req: Request, res: Response) {
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
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      const orders = await prisma.orders.findMany({
        where: {
          OrdersDetail: {
            some: {
              product: {
                userId: req.session.userId,
              },
            },
          },
        },
        include: {
          OrdersDetail: {
            include: {
              product: true,
            },
          },
        },
      });
      let array = [];
      for (let index = 0; index < orders.length; index++) {
        array.push(
          moment
            .tz(
              orders[index].createdAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("HH:mm:ss DD-MM-YYYY")
        );
      }
      res.render("vendorview/vendor.view/orders", {
        orders,
        user,
        array,
        groups,
      });
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signup");
    }
  }

  public async listOrderCancel(req: Request, res: Response) {
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
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      const orders = await prisma.orders.findMany({
        where: {
          status: "CANCELLED",
          OrdersDetail: {
            some: {
              product: {
                userId: req.session.userId,
              },
            },
          },
        },
        include: {
          OrdersDetail: {
            include: {
              product: true,
            },
          },
        },
      });
      let array = [];
      for (let index = 0; index < orders.length; index++) {
        array.push(
          moment
            .tz(
              orders[index].createdAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("HH:mm:ss DD-MM-YYYY")
        );
      }
      res.render("vendorview/vendor.view/orders", {
        orders,
        user,
        array,
        groups,
      });
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signup");
    }
  }

  public async updateOrder(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const confirmOrder = await prisma.orders.update({
        where: { id: parseInt(id) },
        data: {
          status: "ACCEPTED",
        },
      });
      req.flash("success", { msg: "Xác nhận thành công" });
      res.redirect("/vendor/orders");
    } catch (error) {
      req.flash("errors", { msg: "Lỗi không xác định thử lại sau" });
      res.redirect("/vendor/orders");
    }
  }

  public async cancelorder(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const cancelOrder = await prisma.orders.update({
        where: { id: parseInt(id) },
        data: {
          status: "CANCELLED",
        },
      });
      req.flash("success", { msg: "Hủy đơn hàng thành công" });
      res.redirect("/vendor/orders");
    } catch (error) {
      req.flash("errors", { msg: "Lỗi không xác định thử lại sau" });
      res.redirect("/vendor/orders");
    }
  }

  public async orderDetail(req: Request, res: Response) {
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
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      const { id } = req.params;

      const orderDetail = await prisma.orderDetail.findMany({
        where: {
          orderId: parseInt(id),
        },
      });
    }
  }

  public async deleteOrder(req: Request, res: Response) {
    const { id } = req.params;

    const deleteOrderDetail = await prisma.orderDetail.deleteMany({
      where: {
        orderId: parseInt(id),
      },
    });
    const deleteOrder = await prisma.orders.deleteMany({
      where: {
        id: parseInt(id),
      },
    });

    if (deleteOrder) {
      req.flash("success", {
        msg: "Xóa order thành công",
      });
      res.redirect("/vendor/orders");
    } else {
      req.flash("errors", {
        msg: "Xóa thất bại",
      });
      res.redirect("/vendor/orders");
    }
  }

  public async listProducts(req: Request, res: Response) {
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
      let array = [];
      for (let index = 0; index < products.length; index++) {
        array.push(
          moment
            .tz(products[index].createdAt, "ddd MMM DD YYYY HH:mm:ss ZZ", "UTC")
            .format("DD-MM-YYYY HH:mm:ss")
        );
      }
      res.render("vendorview/vendor.view/products", {
        user,
        products,
        array,
        groups,
      });
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập trước khi sử dụng trang này",
      });
      res.redirect("/auth/signin");
    }
  }

  public async editProduct(req: Request, res: Response) {
    const { id } = req.params;
    if (isNaN(+id) == false) {
      const product = await prisma.products.findFirst({
        where: {
          id: +id,
        },
      });
      const productImage = await prisma.images.findMany({
        where: {
          productId: +id,
        },
      });

      const categories = await prisma.categories.findMany();

      res.render("vendorview/vendor.view/editproduct", {
        product,
        categories,
        productImage,
      });
    } else {
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      const categories = await prisma.categories.findMany();
      res.render("vendorview/vendor.view/addproduct", { user, categories });
    }
  }

  public async updateProduct(req: Request, res: Response) {
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
          mainImage: mainImage,
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
        res.redirect("/vendor/products");
      } else {
        req.flash("errors", {
          msg: "Lỗi không xác định",
        });
        res.redirect("/vendor/products");
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
        res.redirect("/vendor/products");
      } else {
        req.flash("errors", {
          msg: "Lỗi không xác định",
        });
        res.redirect("/vendor/products");
      }
    }
  }

  public async deleteProduct(req: Request, res: Response) {
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
      res.redirect("/vendor/products");
    } else {
      req.flash("errors", {
        msg: "Xóa thất bại",
      });
      res.redirect("/vendor/products");
    }
  }

  public async createProduct(req: Request, res: Response) {
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
          categoryId: parseInt(categoryId),
          description,
          inventory: parseInt(inventory),
          view: 0,
          sold: 0,
          mainImage: mainImage,
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
        res.redirect("/vendor/products");
      } else {
        req.flash("errors", {
          msg: "Lỗi không xác định",
        });
        res.redirect("/vendor/products");
      }
    } catch (error) {
      req.flash("errors", {
        msg: "Lỗi không xác định! Thử lại sau",
      });
      res.redirect("/vendor/products");
    }
  }

  public async destroy(req: Request, res: Response) {}
}
