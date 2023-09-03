import { UserController, UserSwagger } from "./users";
import { AuthController } from "./auth";
import { StoreController, StoreSwagger } from "./stores";
import { ReviewController,ReviewSwagger } from "./reviews";


export const Controllers = [UserController, AuthController, StoreController, ReviewController];
export const Swaggers = {
  UserSwagger, ReviewSwagger, StoreSwagger
};