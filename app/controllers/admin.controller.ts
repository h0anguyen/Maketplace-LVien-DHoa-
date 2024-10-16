import { convertFileToBase64 } from "@configs/fileUpload";
import prisma from "@models";
import { Request, Response } from "express";
const moment = require("moment-timezone");
const { startOfMonth } = require("date-fns");
export class AdminController {
  public async index(req: Request, res: Response) {
    if (req.session.userId != null) {
      const checkRole = await prisma.roleUser.findFirst({
        where: {
          userId: +req.session.userId,
          rolesId: 0,
        },
      });
      if (!checkRole) {
        req.flash("errors", {
          msg: "Không đủ vai trò để truy cập ",
        });
        return res.render("userview/auth.view/signin");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập ",
      });
      return res.render("userview/auth.view/signin");
    }
    try {
      const userId = req.session.userId;

      const getUserNew = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: startOfMonth(new Date()),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      let array = [];
      for (let index = 0; index < getUserNew.length; index++) {
        array.push(
          moment
            .tz(
              getUserNew[index].createdAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("YYYY-MM-DD")
        );
      }
      let data: number[] = [1];
      const ttUsers = await prisma.user.count({
        where: {
          roleUsers: {
            some: {
              rolesId: 1,
            },
          },
        },
      });
      const ttProducts = await prisma.products.count();
      res.render("adminview/admin.home.view/index", {
        userId,
        data,
        countUser: ttUsers,
        countProducts: ttProducts,
        users: getUserNew,
        array,
      });
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }

  public async listUsers(req: Request, res: Response) {
    if (req.session.userId != null) {
      console.log(req.session.userId);

      const checkRole = await prisma.roleUser.findFirst({
        where: {
          userId: +req.session.userId,
          rolesId: 0,
        },
      });
      if (!checkRole) {
        req.flash("errors", {
          msg: "Không đủ vai trò để truy cập ",
        });
        return res.render("userview/auth.view/signin");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập ",
      });
      return res.render("userview/auth.view/signin");
    }
    try {
      const userId = req.session.userId;

      const users = await prisma.user.findMany({
        include: {
          roleUsers: true,
        },
        orderBy: {
          id: "asc",
        },
      });
      users.shift();
      let array = [];
      for (let index = 0; index < users.length; index++) {
        array.push(
          moment
            .tz(
              users[index].createdAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("YYYY-MM-DD")
        );
      }
      res.render("adminview/admin.manages.view/users", {
        userId,
        users,
        array,
      });
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }

  public async listProducts(req: Request, res: Response) {
    if (req.session.userId != null) {
      console.log(req.session.userId);

      const checkRole = await prisma.roleUser.findFirst({
        where: {
          userId: +req.session.userId,
          rolesId: 0,
        },
      });
      if (!checkRole) {
        req.flash("errors", {
          msg: "Không đủ vai trò để truy cập ",
        });
        return res.render("userview/auth.view/signin");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập ",
      });
      return res.render("userview/auth.view/signin");
    }
    try {
      const userId = req.session.userId;
      const products = await prisma.products.findMany({
        include: {
          categories: true,
        },
        orderBy: {
          id: "asc",
        },
      });
      let array = [];
      for (let index = 0; index < products.length; index++) {
        array.push(
          moment
            .tz(
              products[index].createdAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("YYYY-MM-DD")
        );
      }
      res.render("adminview/admin.manages.view/products", {
        userId,
        products,
        array,
      });
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleteUser = await prisma.roleUser.deleteMany({
        where: {
          userId: +id,
        },
      });
      const users = await prisma.user.findMany({
        include: {
          roleUsers: true,
        },
      });
      res.redirect("/admin/users");
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }

  public async listCategories(req: Request, res: Response) {
    if (req.session.userId != null) {
      console.log(req.session.userId);

      const checkRole = await prisma.roleUser.findFirst({
        where: {
          userId: +req.session.userId,
          rolesId: 0,
        },
      });
      if (!checkRole) {
        req.flash("errors", {
          msg: "Không đủ vai trò để truy cập ",
        });
        return res.render("userview/auth.view/signin");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập ",
      });
      return res.render("userview/auth.view/signin");
    }
    try {
      const categories = await prisma.categories.findMany();
      let array = [];
      for (let index = 0; index < categories.length; index++) {
        array.push(
          moment
            .tz(
              categories[index].createdAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("YYYY-MM-DD")
        );
      }
      res.render("adminview/admin.manages.view/categories", {
        categories,
        array,
      });
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }

  public async newCategories(req: Request, res: Response) {
    res.render("adminview/admin.manages.view/newcategories");
  }

  public async createCategory(req: Request, res: Response) {
    const { categoryName, description } = req.body;
    try {
      const newCategory = await prisma.categories.create({
        data: {
          categoryName,
          description,
        },
      });
      req.flash("success", {
        msg: "Tạo mới thành công",
      });
      res.redirect("/admin/categories");
    } catch (error) {
      req.flash("errors", {
        msg: "Lỗi tạo mới. Thử lại sau ",
      });
      res.render("adminview/admin.manages.view/newcategories");
    }
  }

  public async listRoles(req: Request, res: Response) {
    if (req.session.userId != null) {
      console.log(req.session.userId);

      const checkRole = await prisma.roleUser.findFirst({
        where: {
          userId: +req.session.userId,
          rolesId: 0,
        },
      });
      if (!checkRole) {
        req.flash("errors", {
          msg: "Không đủ vai trò để truy cập ",
        });
        return res.render("userview/auth.view/signin");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập ",
      });
      return res.render("userview/auth.view/signin");
    }
    try {
      const roles = await prisma.roles.findMany();
      let array = [];
      for (let index = 0; index < roles.length; index++) {
        array.push(
          moment
            .tz(
              roles[index].createdAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("YYYY-MM-DD")
        );
      }
      res.render("adminview/admin.manages.view/roles", {
        roles,
        array,
      });
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }

  public async newRole(req: Request, res: Response) {
    res.render("adminview/admin.manages.view/newrole");
  }

  public async createRole(req: Request, res: Response) {
    const { value } = req.body;
    try {
      const newRole = await prisma.roles.create({
        data: {
          value,
        },
      });
      req.flash("success", {
        msg: "Tạo mới thành công",
      });
      res.redirect("/admin/roles");
    } catch (error) {
      req.flash("errors", {
        msg: "Lỗi tạo mới. Thử lại sau ",
      });
      res.render("adminview/admin.manages.view/newrole");
    }
  }

  public async listBanner(req: Request, res: Response) {
    if (req.session.userId != null) {
      console.log(req.session.userId);

      const checkRole = await prisma.roleUser.findFirst({
        where: {
          userId: +req.session.userId,
          rolesId: 0,
        },
      });
      if (!checkRole) {
        req.flash("errors", {
          msg: "Không đủ vai trò để truy cập ",
        });
        return res.render("userview/auth.view/signin");
      }
    } else {
      req.flash("errors", {
        msg: "Vui lòng đăng nhập ",
      });
      return res.render("userview/auth.view/signin");
    }
    try {
      const userId = 0;
      const banners = await prisma.images.findMany({
        where: {
          bannerId: {
            not: null,
          },
        },
        orderBy: {
          bannerId: "asc",
        },
      });
      let array = [];
      for (let index = 0; index < banners.length; index++) {
        array.push(
          moment
            .tz(
              banners[index].updatedAt,
              "ddd MMM DD YYYY HH:mm:ss ZZ",
              "Asia/Ho_Chi_Minh"
            )
            .format("YYYY-MM-DD")
        );
      }
      res.render("adminview/admin.manages.view/banner", {
        userId,
        banners,
        array,
      });
    } catch {
      req.flash("errors", {
        msg: "Lỗi không xác định ",
      });
      return res.render("userview/auth.view/signin");
    }
  }
  public async updateBanner(req: Request, res: Response) {
    const userId = 0;
    const { id } = req.body;
    const file = req.file ? convertFileToBase64(req.file) : null;
    try {
      if (file != null) {
        const deleteBanner = await prisma.images.deleteMany({
          where: { bannerId: +id },
        });
        const createBanner = await prisma.images.create({
          data: {
            bannerId: +id,
            imageAddress: file,
            location: +id,
            productId: 0,
            updatedAt: new Date(),
          },
        });
        res.redirect("/admin/banner");
      } else {
        return res.redirect("/admin/banner");
      }
    } catch (error) {
      // res.status(500).json({ message: error });

      return res.redirect("/admin/banner");
    }
  }
}
