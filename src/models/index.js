import { UserController, UserSwagger } from "./users";
import { AuthController } from "./auth";
import { StoreController } from "./stores";
import { ReviewController } from "./reviews";

export const Controllers = [UserController, AuthController, StoreController, ReviewController];
export const Swaggers = {
  UserSwagger,
};