import { RestActions } from "@configs/enum";
import { OrderController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class OrderRoute {
  private static path = Router();
  private static orderController = new OrderController();

  public static draw() {
    Route.resource(this.path, this.orderController, {
      only: [RestActions.Index, RestActions.Create],
    });

    return this.path;
  }
}
