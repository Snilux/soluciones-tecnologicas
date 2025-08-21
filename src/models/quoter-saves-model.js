import { success } from "zod/v4";
import getConnection from "../db.js";

class QuoterSavesModel {
  constructor() {
    this.clientes = "clientes";
    this.cotizacion_camaras = "cotizacion_camaras";
    this.cotizacion_cercas = "cotizacion_cercas";
    this.cotizacion_paneles = "cotizacion_paneles";
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

      const query = `SELECT
        c.id AS cliente_id,
        c.nombre AS nombre_cliente,
        c.email AS email_cliente,
        c.telefono AS telefono_cliente,
        c.direccion AS direccion_cliente,

        cc.id AS id_cotizacion_camaras,
        cc.total AS total_camaras,

        ccc.id AS id_cotizacion_cercas,
        ccc.total AS total_cercas,

        cp.id AS id_cotizacion_paneles,
        cp.total AS total_paneles

        FROM ?? c
        LEFT JOIN ?? cc 
            ON c.id = cc.id_cliente
        LEFT JOIN ?? ccc 
            ON c.id = ccc.id_cliente
        LEFT JOIN ?? cp 
            ON c.id = cp.id_cliente
        ORDER BY c.id DESC
        LIMIT ? OFFSET ?;
    `;

      const params = [
        this.clientes,
        this.cotizacion_camaras,
        this.cotizacion_cercas,
        this.cotizacion_paneles,
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

  async getDataQuotesOfCameras(page = 1, limit = 10, type = "camera") {
    const connection = await getConnection();

    // Mapeo de tablas según el tipo
    const tableMap = {
      camera: this.cotizacion_camaras,
      fence: this.cotizacion_cercas,
      panel: this.cotizacion_paneles,
    };
    const table = tableMap[type] || this.cotizacion_camaras;

    try {
      // 1) Contar total de filas en la tabla de cotizaciones seleccionada
      const [[{ total }]] = await connection.query(
        `SELECT COUNT(*) AS total FROM ??`,
        [table]
      );

      // Si no hay registros, responde vacío (tu controller ya lo maneja)
      if (total === 0) {
        return { data: [], totalPages: 0, currentPage: 0 };
      }

      // 2) Calcular páginas y clamp de currentPage
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const offset = (currentPage - 1) * limit;

      // 3) Traer datos paginados (incluye cliente)
      const sql = `
      SELECT q.*, 
             c.id       AS cliente_id,
             c.nombre   AS nombre_cliente,
             c.email    AS email_cliente,
             c.telefono AS telefono_cliente,
             c.direccion AS direccion_cliente
      FROM ?? AS q
      LEFT JOIN ?? AS c ON q.id_cliente = c.id
      ORDER BY q.id DESC
      LIMIT ? OFFSET ?;
    `;

      const [rows] = await connection.query(sql, [
        table,
        this.clientes,
        limit,
        offset,
      ]);

      return {
        data: rows,
        totalPages,
        currentPage,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Database query failed");
    } finally {
      connection.release();
    }
  }

  async getQuoteById(id, idCostumer, type) {
    const connection = await getConnection();
    const query = `SELECT * FROM ?? WHERE id = ?`;
    try {
      let table = this.cotizacion_camaras;
      if (type === "fence") {
        table = this.cotizacion_cercas;
      }
      if (type === "panels") {
        table = this.cotizacion_paneles;
      }

      const quoter = await connection.query(query, [table, id]);

      const costumer = await connection.query(query, [
        this.clientes,
        idCostumer,
      ]);

      if (quoter.length === 0 || costumer.length === 0) {
        return null;
      }
      const data = {
        quoteData: quoter[0][0],
        costumer: costumer[0][0],
      };
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Database query failed");
    } finally {
      connection.release();
    }
  }

  async deleteQuote(id, type) {
    const connection = await getConnection();

    const query = `DELETE FROM ?? WHERE id = ?`;
    let table = this.cotizacion_camaras;
    if (type === "fence") {
      table = this.cotizacion_cercas;
    }
    if (type === "panels") {
      table = this.cotizacion_paneles;
    }

    try {
      const result = await connection.query(query, [table, id]);

      return result;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Database query failed");
    } finally {
      connection.release();
    }
  }

  async deleteCostumerAndQuote(id) {
    const connection = await getConnection();
    const query = `DELETE FROM ?? WHERE id = ?`;
    try {
      const result = await connection.query(query, [this.clientes, id]);
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "No se encontró el cliente o la cotización",
        };
      }
      return {
        success: true,
        message: "Cliente y cotización eliminados correctamente",
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Database query failed");
    } finally {
      connection.release();
    }
  }

  async searchUser(searchType, searchValue) {
    const connection = await getConnection();

    // Validamos que el campo sea permitido
    const allowedFields = ["id", "telefono", "email"];
    if (!allowedFields.includes(searchType)) {
      throw new Error("Campo de búsqueda no válido");
    }

    // Para id usamos comparación exacta, para email/telefono usamos LIKE
    const operador = searchType === "id" ? "=" : "LIKE";
    const value = searchType === "id" ? searchValue : `%${searchValue}%`;

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
        ccc.total AS total_cercas,
        cp.id AS id_cotizacion_paneles,
        cp.total AS total_paneles
    FROM ?? c
    LEFT JOIN ?? cc ON c.id = cc.id_cliente
    LEFT JOIN ?? ccc ON c.id = ccc.id_cliente
    LEFT JOIN ?? cp ON c.id = cp.id_cliente
    WHERE c.${searchType} ${operador} ? 
    ORDER BY c.id DESC;
  `;

    const params = [
      this.clientes,
      this.cotizacion_camaras,
      this.cotizacion_cercas,
      this.cotizacion_paneles,
      value,
    ];

    try {
      const [rows] = await connection.query(query, params);

      if (rows.length === 0) {
        return {
          success: false,
        };
      }

      return { success: true, rows };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Database query failed");
    } finally {
      connection.release();
    }
  }
}

export default new QuoterSavesModel();
