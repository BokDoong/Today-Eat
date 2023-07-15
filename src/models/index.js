import { UserController, UserSwagger } from "./users";
//import { 컨트롤러명 } from "./auth";
import { AuthController } from "./auth";
//import { 컨트롤러명 } from "./stores";

export const Controllers = [UserController, AuthController];
export const Swaggers = {
  UserSwagger,
};