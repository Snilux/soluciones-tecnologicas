import authModel from "../models/auth-model.js";

class AuthController {
  async getUsers(req, res) {
    try {
      const users = await authModel.getUsers();
      res.status(200).json({ users, message: "Users" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving users" });
    }
  }
}

export default new AuthController();
