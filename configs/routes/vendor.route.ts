import { RestActions } from "@configs/enum";
import { VendorController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class VendorRoute {
  private static path = Router();
  private static vendorController = new VendorController();

  public static draw() {
    Route.resource(this.path, this.vendorController, {
      only: [RestActions.Destroy, RestActions.Index, RestActions.Create],
    });

    return this.path;
  }
}
