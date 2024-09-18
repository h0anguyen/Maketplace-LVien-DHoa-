import { RestActions } from "@configs/enum";
import { SearchController } from "@controllers";
import { Router } from "express";
import { Route } from ".";

export class SearchRoute {
  private static path = Router();
  private static searchController = new SearchController();

  public static draw() {
    Route.resource(this.path, this.searchController, {
      only: [RestActions.Index],
    });

    return this.path;
  }
}
