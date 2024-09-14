import { AuthController } from "@controllers";
import { Router } from "express";

export class AuthRoute {
  private static path = Router();
  private static authController = new AuthController();

  public static draw() {
    this.path.route("/signup").get(this.authController.signup);

    return this.path;
  }
}
