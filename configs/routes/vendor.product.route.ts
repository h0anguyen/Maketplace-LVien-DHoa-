import { RestActions } from "@configs/enum";
import { VendorProductController } from "@controllers";
import { Router } from "express";
import { Route } from ".";
import { upload } from "../fileUpload";

export class VendorProductRoute {
  private static path = Router();
  private static vendorproductController = new VendorProductController();

  public static draw() {
    this.path.post(
      "/",
      upload.array("imageMain"),
      this.vendorproductController.create
    );
    this.path.patch(
      "/:id",
      upload.array("imageMain"),
      this.vendorproductController.update
    );

    Route.resource(this.path, this.vendorproductController, {
      only: [
        RestActions.Destroy,
        RestActions.Index,
        RestActions.New,
        RestActions.Edit,
      ],
    });

    return this.path;
  }
}
