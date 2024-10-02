import { RestActions } from "@configs/enum";
import { OrderController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class OrderRoute {
  private static path = Router();
  private static orderController = new OrderController();

  public static draw() {
    this.path.route("/api/districts").get(this.orderController.getDistricts);
    this.path.route("/api/wards").get(this.orderController.getWards);

    this.path
      .route("/")
      .get(this.orderController.isAuthenticated, this.orderController.index);
    Route.resource(this.path, this.orderController, {
      only: [RestActions.Create],
    });

    return this.path;
  }
}
