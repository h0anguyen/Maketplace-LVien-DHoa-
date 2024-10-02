import { RestActions } from "@configs/enum";
import { PaymentController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class PaymentRoute {
  private static path = Router();
  private static paymentController = new PaymentController();

  public static draw() {
    this.path.route("/").post(this.paymentController.payment);
    this.path.route("/vnpay-ipn").get(this.paymentController.paymentIpn);
    this.path.route("/vnpay-return").get(this.paymentController.paymentReturn);

    Route.resource(this.path, this.paymentController, {
      only: [RestActions.Index  ],
    });
    return this.path;
  }
}
