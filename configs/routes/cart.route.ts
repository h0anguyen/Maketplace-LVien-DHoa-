import { RestActions } from "@configs/enum";
import { CartController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class CartRoute {
  private static path = Router();
  private static cartController = new CartController();

  public static draw() {
    this.path
      .route("/handleCartActions")
      .post(this.cartController.handleCartActions);
    Route.resource(this.path, this.cartController, {
      only: [RestActions.Index, RestActions.Create],
    });

    return this.path;
  }
}
