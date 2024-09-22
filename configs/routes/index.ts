import { VendorOrderRoute } from "@configs/routes/vendor.order.route";
import { Router } from "express";
import { HomeController } from "../../app/controllers/home.controller";
import { RestActions } from "../enum";
import { AdminRoute } from "./admin.route";
import { AuthRoute } from "./auth.route";
import { CategoryRoute } from "./category.route";
import { ProductRoute } from "./product.route";
import { UserRoute } from "./user.route";
import { VendorProductRoute } from "./vendor.product.route";
import { VendorRoute } from "./vendor.route";

export class Route {
  private static path = Router();
  private static homeController = new HomeController();

  public static draw() {
    this.path.use("/auth", AuthRoute.draw());
    this.path.use("/user", UserRoute.draw());
    this.path.use("/vendor", VendorRoute.draw());
    this.path.use("/vendorproduct", VendorProductRoute.draw());
    this.path.use("/vendororder", VendorOrderRoute.draw());

    this.path.use("/search", SearchRoute.draw());
    this.path.use("/admin", AdminRoute.draw());

    this.path.use("/product", ProductRoute.draw());
    this.path.use("/category", CategoryRoute.draw());


    Route.resource(this.path, this.homeController, {
      only: [RestActions.Index],
    });
    return this.path;
  }

  public static resource(
    path: Router,
    customController: any,
    filter?: {
      only?: RestActions[];
      except?: RestActions[];
    }
  ) {
    if (filter?.only && filter?.except) {
      throw new Error("Can only pass only or except!");
    }

    if (this.isAllowAccess(filter?.only, filter?.except, RestActions.Index))
      path.route("/").get(customController.index);

    if (this.isAllowAccess(filter?.only, filter?.except, RestActions.New))
      path.route("/new").get(customController.new);

    if (this.isAllowAccess(filter?.only, filter?.except, RestActions.Show))
      path.route("/:id").get(customController.show);

    if (this.isAllowAccess(filter?.only, filter?.except, RestActions.Create))
      path.route("/").post(customController.create);

    if (this.isAllowAccess(filter?.only, filter?.except, RestActions.Edit))
      path.route("/:id/edit").get(customController.edit);

    if (this.isAllowAccess(filter?.only, filter?.except, RestActions.Update))
      path.route("/:id").put(customController.update);

    if (this.isAllowAccess(filter?.only, filter?.except, RestActions.Destroy))
      path.route("/:id").delete(customController.destroy);
  }

  private static isAllowAccess(
    only: RestActions[] | undefined,
    except: RestActions[] | undefined,
    action: RestActions
  ) {
    return (
      (!only && !except) ||
      (only && only?.includes(action)) ||
      (except && !except?.includes(action))
    );
  }
}
