import getConnection from "../db.js";

class QuoterModel {
  async getQuoteCameraData() {
    const connection = await getConnection();
    try {
      const result = await connection.query(`SELECT 
        p.id AS parametro_id,
        p.nombre AS parametro,
        v.id AS valor_id,
        v.valor,
        v.precio
        FROM parametros p
        JOIN valores_parametro v ON p.id = v.parametro_id
        ORDER BY p.id, v.id;
        `);

      return result[0];
      
    } catch (error) {
      console.error("Error in getQuoteCameraData:", error);
      throw error;
    }
  }
}

export default new QuoterModel();
