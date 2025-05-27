import getConnection from "../db.js";

class AuthModel {
  async getUsers() {
    const connection = await getConnection();
    try {
      const result = await connection.query(`SELECT * FROM users`);
      return result[0];
    } catch (error) {
      console.error("Error in getUsers:", error);
      throw error;
    }
  }
}

export default new AuthModel();
