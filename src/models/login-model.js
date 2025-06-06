import { success } from "zod/v4";
import getConnection from "../db.js";
import bcrypt from "bcrypt";

class LoginModel {
  /**
   * @class LoginModel
   * @description Model for handling user login operations.
   */
  constructor() {
    this.table = "users";
  }
  async validateUser(username) {
    const query = `SELECT id, username, pass FROM ?? WHERE username = ?`;
    const connection = await getConnection();
    try {
      const results = await connection.query(query, [this.table, username]);
      if (results[0].length > 0) {
        return {
          isValid: true,
          password: results[0][0].pass,
          username: results[0][0].username,
          id: results[0][0].id,
        };
      } else {
        return {
          isValid: false,
          password: null,
          username: null,
          id: null,
        };
      }
    } catch (error) {
      console.log(`Error in find user by username: ${error}`);
      throw error;
    }
  }

  async handleLogin(data) {
    const userIsValid = await this.validateUser(data.username);

    if (!userIsValid.isValid) {
      return {
        success: false,
        errorMessage: "El usuario no existe",
      };
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      userIsValid.password
    );
    if (!isPasswordValid) {
      return {
        success: false,
        errorMessage: "Contraseña incorrecta",
      };
    }

    return {
      success: true,
      successMessage: "Inicio de sesión exitoso",
      username: userIsValid.username,
      id: userIsValid.id, // Assuming you have userId in your database
    };
  }
}

export default new LoginModel();
