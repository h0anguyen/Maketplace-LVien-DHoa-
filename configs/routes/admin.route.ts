import { RestActions } from "@configs/enum";
import { AdminController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class AdminRoute {
  private static path = Router();
  private static adminController = new AdminController();

  public static draw() {
    this.path.route("/users").get(this.adminController.listUsers);
    this.path.route("/products").get(this.adminController.listProducts);
    this.path.route("/user/:id").put(this.adminController.update);

    Route.resource(this.path, this.adminController, {
      only: [RestActions.Index],
    });

    return this.path;
  }
}
