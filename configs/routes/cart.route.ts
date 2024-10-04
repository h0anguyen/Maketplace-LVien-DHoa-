import { CartController } from "@controllers";
import { Router } from "express";

export class CartRoute {
  private static path = Router();
  private static cartController = new CartController();

  public static draw() {
    this.path
      .route("/")
      .get(this.cartController.isAuthenticated, this.cartController.index);
    this.path
      .route("/")
      .post(this.cartController.isAuthenticated, this.cartController.create);
    this.path
      .route("/handleCartActions")
      .post(this.cartController.handleCartActions);
    // Route.resource(this.path, this.cartController, {
    //   only: [RestActions.Create],
    // });

    return this.path;
  }
}
