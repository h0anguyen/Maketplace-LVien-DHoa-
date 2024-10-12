import { RestActions } from "@configs/enum";
import { VendorOrderController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class VendorOrderRoute {
  private static path = Router();
  private static vendorOrderController = new VendorOrderController();

  public static draw() {
    this.path.route("/:id").put(this.vendorOrderController.update);
    this.path.route("/:id/cancel").put(this.vendorOrderController.cancelorder);
    Route.resource(this.path, this.vendorOrderController, {
      only: [RestActions.Destroy, RestActions.Index, RestActions.Show],
    });

    return this.path;
  }
}
