import { RestActions } from "@configs/enum";
import { ProductController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class ProductRoute {
  private static path = Router();
  private static productController = new ProductController();

  public static draw() {
    this.path
      .route("/api/products")
      .get(this.productController.getMoreProductsV2);

    this.path.route("/search").get(this.productController.search);
    this.path.route("/submit-review").post(this.productController.addReview);

    this.path.route("/search").get(this.productController.search);
    Route.resource(this.path, this.productController, {
      only: [RestActions.Index, RestActions.Show],
    });

    return this.path;
  }
}
