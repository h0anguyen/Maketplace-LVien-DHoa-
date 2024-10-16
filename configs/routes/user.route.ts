import { RestActions } from "@configs/enum";
import { UserController } from "@controllers";
import { Router } from "express";
import { Route } from ".";
import { upload } from "../fileUpload";

export class UserRoute {
  private static path = Router();
  private static userController = new UserController();

  public static draw() {
    this.path.route("/editPassword").get(this.userController.editPassword);
    this.path.route("/purchase").get(this.userController.purchase);
    this.path
      .route("/")
      .post(this.userController.validateSignUp, this.userController.create);
    this.path.put("/:id", upload.single("avatar"), this.userController.update);
    this.path
      .route("/:id/changePassword")
      .put(this.userController.changePassword);
    this.path
      .route("/")
      .get(this.userController.isAuthenticated, this.userController.index);

    Route.resource(this.path, this.userController, {
      only: [RestActions.Destroy],
    });

    return this.path;
  }
}
