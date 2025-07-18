import getConnection from "../db.js";

class QuoterSavesModel {
  constructor() {
    this.clientes = "clientes";
    this.cotizacion_camaras = "cotizacion_camaras";
    this.cotizacion_cercas = "cotizacion_cercas";
  }

  async getDataQuoterSavesForUsers(page = 1, limit = 10) {
    const connection = await getConnection();
    const offset = (page - 1) * limit;

    try {
      // Obtener total de clientes para calcular páginas
      const [numberOfSaves] = await connection.query(
        `SELECT COUNT(*) AS total FROM ??`,
        [this.clientes]
      );

      const total = numberOfSaves[0].total;
      const totalPages = Math.ceil(total / limit);

      // Consulta de datos con JOIN y paginación
      const query = `
        SELECT
          c.id AS cliente_id,
          c.nombre AS nombre_cliente,
          c.email AS email_cliente,
          c.telefono AS telefono_cliente,
          c.direccion AS direccion_cliente,
          cc.id AS id_cotizacion_camaras,
          cc.total AS total_camaras,
          ccc.id AS id_cotizacion_cercas,
          ccc.total AS total_cercas
        FROM ?? c
        LEFT JOIN ?? cc ON c.id = cc.id_cliente
        LEFT JOIN ?? ccc ON c.id = ccc.id_cliente
        ORDER BY c.id DESC
        LIMIT ? OFFSET ?
      `;

      const params = [
        this.clientes,
        this.cotizacion_camaras,
        this.cotizacion_cercas,
        limit,
        offset,
      ];

      const [results] = await connection.query(query, params);

      if (results.length === 0) {
        return null;
      }

      return {
        costumers: results,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Database query failed");
    } finally {
      connection.release();
    }
  }

  async getQuoteCamerasById(id) {
    const connection = await getConnection();
    const query = `SELECT * FROM ?? WHERE id = ?`;
    try {
      const result = await connection.query(query, [
        this.cotizacion_camaras,
        id,
      ]);

      if (result.length === 0) {
        return null;
      }

      return result[0][0];
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Database query failed");
    } finally {
      connection.release();
    }
  }
}

export default new QuoterSavesModel();
