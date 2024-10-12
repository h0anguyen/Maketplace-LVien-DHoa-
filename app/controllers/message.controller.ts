import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";
export class MessageController extends ApplicationController {
  public async create(req: Request, res: Response) {
    // console.log(req.body);
    const a = req.body;
    const { userId, message, receiverId } = req.body;
    const groupId = Math.floor(10000000 + Math.random() * 90000000).toString();

    const checkGroup = await prisma.groud.findFirst({
      where: {
        id: +groupId,
      },
    });
    if (!checkGroup && receiverId) {
      const createGroup = await prisma.groud.create({
        data: {
          id: +groupId,
          groudName: groupId.toString(),
          Participants: {
            createMany: {
              data: [
                {
                  userId: +userId,
                },
                {
                  userId: +receiverId,
                },
              ],
            },
          },
        },
      });
    }
    if (message && checkGroup) {
      const sendMessage = await prisma.messages.create({
        data: {
          sender: +userId,
          content: message,
          groudId: checkGroup.id,
        },
      });

      res.status(201).json({ message: a });
    } else {
      res.redirect("back");
    }
    // console.log(createMessage);
    // res.status(201).json({ message: a });
  }
}
