import getConnection from "../db.js";

class CostumerModel {
  constructor() {
    this.clientes = "clientes";
  }
  async saveCostumerData(dataCostumer) {
    const connection = await getConnection();
    const cleanedPhone = dataCostumer.phone.replace(/[^\d]/g, "");
    const query = `INSERT INTO ?? (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)`;
    const params = [
      this.clientes,
      dataCostumer.name,
      dataCostumer.email,
      cleanedPhone,
      dataCostumer.address,
    ];

    try {
      const result = await connection.query(query, params);
      if (result[0].affectedRows === 0) {
        return {
          errorMessage: "No se pudo guardar los datos del cliente",
          success: false,
        };
      }
      return {
        successMessage: "Datos del cliente guardados correctamente",
        affectedRows: result[0].affectedRows,
        id: result[0].insertId,
        success: true,
      };
    } catch (error) {
      console.error("Error in saveCostumerData:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async findCostumerByEmail(dataCostumer) {
    const connection = await getConnection();
    const query = `SELECT * FROM ?? WHERE email = ?`;
    const params = [this.clientes, dataCostumer.email];

    try {
      const result = await connection.query(query, params);
      if (result[0].length === 0) {
        return null; // No se encontró el cliente
      }
      return result[0][0]; // Retorna el primer cliente encontrado
    } catch (error) {
      console.error("Error in findCostumerByEmail:", error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new CostumerModel();
