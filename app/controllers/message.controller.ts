import prisma from "@models";
import { Request, Response } from "express";
import { ApplicationController } from ".";
export class MessageController extends ApplicationController {
  public async create(req: Request, res: Response) {
    const a = req.body;
    console.log(a);
    const { id } = req.params;
    const { userId, message } = req.body;
    let { receiverId } = req.body;
    console.log(receiverId);
    if (!receiverId) receiverId = id;
    console.log(receiverId);
    let checkGroup;
    if (receiverId) {
      checkGroup = await prisma.participants.findFirst({
        where: {
          OR: [
            { userId: +userId, groudId: { in: [+receiverId] } },
            { userId: +receiverId, groudId: { in: [+userId] } },
          ],
        },
      });
      console.log(checkGroup);
    }
    if (a.groupId) {
      checkGroup = await prisma.participants.findFirst({
        where: {
          groudId: +a.groupId,
        },
      });
    }
    console.log(checkGroup);

    if (!checkGroup && receiverId) {
      const groupId = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();
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
    console.log(checkGroup, a.groupId);
    if (message && checkGroup) {
      console.log("gửi tin nhắn");
      const sendMessage = await prisma.messages.create({
        data: {
          sender: +userId,
          content: message,
          groudId: +a.groupId,
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
