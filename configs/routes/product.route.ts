import { RestActions } from "@configs/enum";
import { ProductController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class ProductRoute {
  private static path = Router();
  private static productController = new ProductController();

  public static draw() {
    this.path.route("/shop/:id").get(this.productController.shopView);

    this.path.route("/search").get(this.productController.Search);
    Route.resource(this.path, this.productController, {
      only: [RestActions.Index, RestActions.Show],
    });

    return this.path;
  }
}
