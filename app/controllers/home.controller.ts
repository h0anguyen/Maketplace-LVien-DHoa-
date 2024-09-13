import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ApplicationController } from ".";

const prisma = new PrismaClient();

export class HomeController extends ApplicationController {
  public async index(req: Request, res: Response) {
    if (req.session.userId) {
      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      res.render("userview/home.view/index", { user });
    } else {
      res.render("userview/home.view/index", {});
    }
  }
}