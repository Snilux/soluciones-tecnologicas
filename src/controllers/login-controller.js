import LoginModel from "../models/login-model.js";
import { validateUser } from "../schemas/users.js";
import { validateEmail } from "../schemas/login.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";
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

  async renderForgotPassword(req, res) {
    res.render("login/forgot-password", {
      tittle: "Recuperar contraseña",
    });
  }

  async handleForgotPassword(req, res) {
    console.log(req.body);

    const email = validateEmail(req.body);
    if (!email.success) {
      const flatErrors = Object.values(
        email.error.flatten().fieldErrors
      ).flat();
      console.log(flatErrors);

      return res.status(400).json({
        error: "Datos del email inválidos",
        messages: flatErrors,
      });
    }
    try {
      const user = await LoginModel.findEmail(email.data.email);
      if (!user.isValid) {
        return res.status(404).json({
          errorMessage: "El correo electrónico no está registrado",
        });
      }

      const resetToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET_RESET,
        {
          expiresIn: "15m",
        }
      );

      await LoginModel.saveResetToken(user.email, resetToken);

      const resetLink = `${req.protocol}://${req.get(
        "host"
      )}/login/resetPassword/${resetToken}`;

      await sendPasswordResetEmail(user.email, resetLink);

      return res.status(200).json({
        successMessage:
          "Se ha enviado un enlace de recuperación al correo electrónico proporcionado",
        email: user.email,
      });
    } catch (error) {
      console.error(`Error in handleForgotPassword: ${error}`);
      res.status(500).json({
        errorMessage:
          "Error al procesar la solicitud de recuperación de contraseña",
      });
    }
  }

  async renderResetPassword(req, res) {
    const token = req.params.token;
    if (!token) {
      return res.status(400).json({
        errorMessage: "Token de recuperación no proporcionado",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_RESET);
      res.render("login/reset-password", {
        tittle: "Restablecer contraseña",
        id: decoded.id,
        email: decoded.email,
        token: token,
      });
    } catch (error) {
      console.error(`Error in renderResetPassword: ${error}`);
      return res.render("error-token", {
        tittle: "Token inválido",
        errorMessage: "El token de recuperación es inválido o ha expirado.",
      });
    }
  }

  async handleResetPassword(req, res) {
    const { newPassword, confirmPassword, token } = req.body;

    // Validaciones básicas
    if (!newPassword || !confirmPassword || !token) {
      return res.status(400).json({
        errorMessage: "Todos los campos son obligatorios",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        errorMessage: "Las contraseñas no coinciden",
      });
    }

    try {
      // Validar y usar el token
      const result = await LoginModel.validateAndUseResetToken(token);
      if (!result.valid) {
        // return res.render("error-token", {
        //   tittle: "Token inválido",
        //   errorMessage: "El token de recuperación es inválido o ha expirado.",
        // });
        return res
          .status(401)
          .json({ errorMessage: "Token expirado vuele a intentarlo" });
      }

      const emailFromToken = result.email;

      const user = await LoginModel.findEmail(emailFromToken);
      // Actualizar contraseña en la BD
      await LoginModel.updatePassword(user.id, newPassword);

      return res.status(200).json({
        successMessage: "Contraseña restablecida exitosamente",
      });
    } catch (error) {
      console.error(`Error in renderResetPassword: ${error}`);
      return res.render("error-token", {
        tittle: "Token inválido",
        errorMessage: "El token de recuperación es inválido o ha expirado.",
      });
    }
  }
}

export default new LoginController();
