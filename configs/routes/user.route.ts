import { RestActions } from "@configs/enum";
import { UserController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class UserRoute {
  private static path = Router();
  private static userController = new UserController();

  public static draw() {
    this.path.route("/").post(this.userController.create);

    Route.resource(this.path, this.userController, {
      only: [RestActions.Destroy, RestActions.Index],
    });

    return this.path;
  }
}
