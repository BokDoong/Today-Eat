import { UserController, UserSwagger } from "./users";
import { AuthController } from "./auth";
import { StoreController } from "./stores";

export const Controllers = [UserController, AuthController, StoreController];
export const Swaggers = {
  UserSwagger,
};