import getConnection from "../db.js";

class AuthModel {
  async getUsers() {
    const connection = await getConnection();
    const result = await connection.query(`SELECT * FROM users`);
    console.log(result[0]);
  }
}

export default new AuthModel();
