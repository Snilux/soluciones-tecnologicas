import LoginModel from "../models/login-model.js";
import { validateUser } from "../schemas/users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class LoginController {
  async renderLogin(req, res) {
    res.render("login/login", {
      tittle: "Login",
    });
  }

  async handleLogin(req, res) {
    const user = validateUser(req.body);
    if (!user.success) {
      return res.status(400).json({
        errorMessage: "Error en la validación de los datos",
        error: user.error.format(),
      });
    }

    try {
      const response = await LoginModel.handleLogin(user.data);
      const token = jwt.sign(
        {
          username: response.username,
          id: response.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      if (response.success === false) {
        return res.status(401).json({
          errorMessage: response.errorMessage,
        });
      }

      if (response.success === true) {
        return res
          .cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            sameSite: "Strict",
            maxAge: 3600000,
          })
          .status(200)
          .json({
            successMessage: response.successMessage,
            username: response.username,
            id: response.id,
          });
      }
    } catch (error) {
      console.error(`Error in controller handleLogin ${error}`);
      res.status(500).json({
        errorMessage: "Error al iniciar sesión",
      });
    }
  }

  async handleLogout(req, res) {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "Strict",
    });
    res.status(200).json({
      successMessage: "Sesión cerrada correctamente",
    });
  }
}
export default new LoginController();
