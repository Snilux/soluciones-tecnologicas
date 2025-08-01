import { email } from "zod/v4";
import getConnection from "../db.js";
import bcrypt from "bcrypt";

class UserModel {
  constructor() {
    this.table = "users";
  }
  async getUsers() {
    const connection = await getConnection();
    try {
      const results = await connection.query("SELECT * FROM ??", [this.table]);
      return results[0];
    } catch (error) {
      console.log(`Error in getUsers: ${error}`);
    } finally {
      connection.release();
    }
  }

  async validateUser(username) {
    const query = `SELECT username FROM ?? WHERE username = ?`;
    const connection = await getConnection();
    try {
      const results = await connection.query(query, [this.table, username]);
      return results[0].length > 0;
    } catch (error) {
      console.log(`Error in find user by username: ${error}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  async createUser(data) {
    const { username, password, email } = data;

    // Check if the user already exists
    const userExists = await this.validateUser(username);
    if (userExists) {
      return {
        errorMessage: "El usuario ya existe",
        success: false,
      };
    }

    const query = `INSERT INTO ?? (username, pass, email) VALUES (?, ?, ?)`;
    const connection = await getConnection();

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const results = await connection.query(query, [
        this.table,
        username,
        hashedPassword,
        email,
      ]);

      return {
        success: true,
        id: results.insertId,
        username: username,
      };
    } catch (error) {
      console.log(`Error in createUser: ${error}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserById(id) {
    const query = `SELECT * FROM ?? WHERE id = ?`;
    const connection = await getConnection();
    try {
      const results = await connection.query(query, [this.table, id]);

      if (results[0].length === 0) {
        return null;
      }
      const user = {
        username: results[0][0].username,
        email: results[0][0].email,
        id: results[0][0].id,
      };
      console.log(user);

      return user;
    } catch (error) {
      console.log(`Error in get user ${id}: ${error}`);
    }
  }

  async updateUser(id, data) {
    const { username, email, password } = data;
    console.log(data);
    console.log(id);

    const query = `UPDATE ?? SET username = ?, pass = ?, email = ? WHERE id = ? `;
    const connection = await getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const results = await connection.query(query, [
        this.table,
        username,
        hashedPassword,
        email,
        id,
      ]);
      if (results.affectedRows === 0) {
        return {
          errorMessage: "No se pudo actualizar el usuario",
          success: false,
        };
      }
      return {
        success: true,
        successMessage: "Usuario actualizado correctamente",
        id: id,
        username: username,
      };
    } catch (error) {
      console.log(`Error in updateUser: ${error}`);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new UserModel();
