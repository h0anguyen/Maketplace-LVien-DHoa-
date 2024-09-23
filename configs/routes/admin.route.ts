import { RestActions } from "@configs/enum";
import { AdminController } from "@controllers";
import { Router } from "express";
import { Route } from ".";
import { upload } from "../fileUpload";

export class AdminRoute {
  private static path = Router();
  private static adminController = new AdminController();

  public static draw() {
    this.path.route("/users").get(this.adminController.listUsers);
    this.path.route("/products").get(this.adminController.listProducts);
    this.path.route("/user/:id").put(this.adminController.update);
    this.path.route("/categories").get(this.adminController.listCategories);
    this.path.route("/categories/new").get(this.adminController.newCategories);
    this.path.route("/categories").post(this.adminController.createCategory);
    this.path.route("/roles").get(this.adminController.listRoles);
    this.path.route("/role/new").get(this.adminController.newRole);
    this.path.route("/roles").post(this.adminController.createRole);
    this.path.route("/banner").get(this.adminController.listBanner);
    this.path.put(
      "/banner",
      upload.single("banner"),
      this.adminController.updateBanner
    );

    Route.resource(this.path, this.adminController, {
      only: [RestActions.Index],
    });

    return this.path;
  }
}
