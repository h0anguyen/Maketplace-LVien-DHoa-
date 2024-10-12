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
      checkGroup = await prisma.participants.findMany({
        where: {
          AND: [{ userId: +userId }, { userId: +receiverId }],
        },
      });
    } else {
      checkGroup = await prisma.participants.findMany({
        where: {
          groudId: +a.groupId,
        },
      });
    }
    console.log(checkGroup.length);

    // if (checkGroup.length <= 0 && receiverId) {
    //   const groupId = Math.floor(
    //     10000000 + Math.random() * 90000000
    //   ).toString();
    //   const createGroup = await prisma.groud.create({
    //     data: {
    //       id: +groupId,
    //       groudName: groupId.toString(),
    //       Participants: {
    //         createMany: {
    //           data: [
    //             {
    //               userId: +userId,
    //             },
    //             {
    //               userId: +receiverId,
    //             },
    //           ],
    //         },
    //       },
    //     },
    //   });
    // }
    console.log(checkGroup);
    if (message && checkGroup[0]) {
      console.log("gửi tin nhắn");
      const sendMessage = await prisma.messages.create({
        data: {
          sender: +userId,
          content: message,
          groudId: checkGroup[0].groudId,
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
