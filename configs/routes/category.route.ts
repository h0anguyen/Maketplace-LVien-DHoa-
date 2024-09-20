import { RestActions } from "@configs/enum";
import { CategoryController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class CategoryRoute {
  private static path = Router();
  private static categoryController = new CategoryController();

  public static draw() {
    Route.resource(this.path, this.categoryController, {
      only: [RestActions.Show],
    });

    return this.path;
  }
}
