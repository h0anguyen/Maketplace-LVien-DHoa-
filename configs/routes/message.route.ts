import { RestActions } from "@configs/enum";
import { MessageController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class MessageRoute {
  private static path = Router();
  private static messageController = new MessageController();

  public static draw() {
    Route.resource(this.path, this.messageController, {
      only: [RestActions.Create],
    });

    return this.path;
  }
}
