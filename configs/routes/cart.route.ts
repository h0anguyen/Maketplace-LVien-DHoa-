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
      .route("/update")
      .post(this.cartController.isAuthenticated, this.cartController.update);
    this.path
      .route("/remove")
      .post(this.cartController.isAuthenticated, this.cartController.remove);

    return this.path;
  }
}
