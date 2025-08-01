import getConnection from "../db.js";
import bcrypt from "bcrypt";

class LoginModel {
  /**
   * @class LoginModel
   * @description Model for handling user login operations.
   */
  constructor() {
    this.table = "users";
    this.password_reset_tokens = "password_reset_tokens";
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
    } finally {
      connection.release();
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

  async findEmail(email) {
    const query = `SELECT id, email FROM ?? WHERE email = ?`;
    const connection = await getConnection();
    try {
      const results = await connection.query(query, [this.table, email]);
      if (results[0].length > 0) {
        return {
          isValid: true,
          id: results[0][0].id,
          email: results[0][0].email,
        };
      } else {
        return {
          isValid: false,
          id: null,
          email: null,
        };
      }
    } catch (error) {
      console.log(`Error in find user by email: ${error}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  async saveResetToken(email, token, expiresInMinutes = 15) {
    const connection = await getConnection();

    const saltRounds = 10;
    const tokenHash = await bcrypt.hash(token, saltRounds); // Usamos bcrypt aquí

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60000);

    const query = `
    INSERT INTO ?? (email, token_hash, expires_at)
    VALUES (?, ?, ?)
  `;
    try {
      await connection.query(query, [
        this.password_reset_tokens,
        email,
        tokenHash,
        expiresAt,
      ]);
    } catch (error) {
      console.error(`Error saving reset token: ${error}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  async validateAndUseResetToken(token) {
    const connection = await getConnection();

    // Obtiene todos los tokens válidos (no usados y no expirados)
    try {
      const [rows] = await connection.query(
        `
    SELECT * FROM ?? 
    WHERE used = FALSE AND expires_at > NOW()
    ORDER BY created_at DESC
  `,
        [this.password_reset_tokens]
      );

      // Recorre tokens válidos y compara con bcrypt
      for (const row of rows) {
        const match = await bcrypt.compare(token, row.token_hash);
        if (match) {
          // Marcar como usado
          await connection.query(`UPDATE ?? SET used = TRUE WHERE id = ?`, [
            this.password_reset_tokens,
            row.id,
          ]);
          return { valid: true, email: row.email };
        }
      }

      return { valid: false };
    } catch (error) {
      console.error(`Error validating reset token: ${error}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  async updatePassword(id, newPassword) {
    const query = `UPDATE ?? SET pass = ? WHERE id = ?`;
    const connection = await getConnection();
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await connection.query(query, [this.table, hashedPassword, id]);
      return { success: true };
    } catch (error) {
      console.log(`Error in reset password: ${error}`);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new LoginModel();
