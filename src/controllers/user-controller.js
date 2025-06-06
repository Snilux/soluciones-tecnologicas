import UserModel from "../models/user-model.js";
import { validateUser } from "../schemas/users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class UserController {
  async getUsers(req, res) {
    try {
      const users = await UserModel.getUsers();

      const { username, id } = req.user;
      return res.render("admin/users", {
        title: "Usuarios",
        users: users,
        username: username,
        id: id,
      });
      
    } catch (error) {
      console.log(`Error in get users controller: ${error}`);
      return res.status(403).json({
        error: "Unauthorized",
        errorMessage: "Token inválido o expirado",
      });
    }
  }

  async addUser(req, res) {
    try {
      const user = validateUser(req.body);

      if (!user.success) {
        return res.status(400).json({
          errorMessage: "Error en la validacion de los datos",
          error: user.error.format(),
        });
      }

      const newUser = await UserModel.createUser(user.data);

      if (!newUser.success) {
        return res.status(400).json({
          errorMessage: newUser.errorMessage,
        });
      }

      return res.status(201).json({
        successMessage: "Usuario creado correctamente",
        user: newUser,
      });
    } catch (error) {
      console.log(`Error in create user controller: ${error}`);

      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        console.error("Headers already sent, cannot send 500 error response.");
      }
    }
  }

  async getUserById(req, res) {
    const { id } = req.params;

    try {
      const user = await UserModel.getUserById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.render("admin/edit-user", {
        title: "Editar Usuario",
        user: user,
      });
    } catch (error) {
      console.log(`Error in get user by id controller: ${error}`);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async updateUser(req, res) {
    const { id } = req.params;
    const user = validateUser(req.body);

    if (!user.success) {
      const errors = user.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });

      console.log(errors[0]);

      return res.status(400).json({
        errorMessage: `Error en la validación de los datos \n`,
        errors: errors || "Datos inválidos",
      });
    }

    const updateUser = await UserModel.updateUser(id, user.data);

    if (!updateUser.success) {
      return res.status(400).json({
        errorMessage: updateUser.errorMessage,
      });
    }
    return res.status(200).json({
      successMessage: "Usuario actualizado correctamente",
      user: {
        id: updateUser.id,
        username: updateUser.username,
      },
    });
  }
}

export default new UserController();
