import { RestActions } from "@configs/enum";
import { VendorController } from "@controllers";
import { Router } from "express";
import { Route } from ".";
import { upload } from "../fileUpload";

export class VendorRoute {
  private static path = Router();
  private static vendorController = new VendorController();

  public static draw() {
    this.path
      .route("/orders")
      .get(
        this.vendorController.checkRoleVendor,
        this.vendorController.listOrder
      );
    this.path
      .route("/orders/cancel")
      .get(this.vendorController.listOrderCancel);
    this.path
      .route("/orders/:id")
      .get(
        this.vendorController.checkRoleVendor,
        this.vendorController.orderDetail
      );
    this.path.route("/orders/:id").put(this.vendorController.updateOrder);
    // this.path
    //   .route("/orders/cancel/:id")
    //   .put(this.vendorController.cancelorder);
    this.path.route("/orders/:id").delete(this.vendorController.deleteOrder);

    this.path
      .route("/products")
      .get(
        this.vendorController.checkRoleVendor,
        this.vendorController.listProducts
      );

    this.path.post(
      "/product",
      upload.array("imageMain"),
      this.vendorController.createProduct
    );
    this.path.patch(
      "/product/:id",
      upload.array("imageMain"),
      this.vendorController.updateProduct
    );
    this.path.route("/product/:id").delete(this.vendorController.deleteProduct);
    this.path
      .route("/product/:id")
      .get(
        this.vendorController.checkRoleVendor,
        this.vendorController.editProduct
      );

    this.path
      .route("/")
      .get(this.vendorController.checkRoleVendor, this.vendorController.index);
    this.path.route("/new").get(this.vendorController.new);

    Route.resource(this.path, this.vendorController, {
      only: [RestActions.Destroy, RestActions.Create],
    });

    return this.path;
  }
}
