import { success } from "zod/v4";
import getConnection from "../db.js";

class QuoterModel {
  constructor() {
    this.valores_parametro_camaras = "valores_parametro_camaras";
    this.parametros_camaras = "parametros_camaras";
  }

  async getQuoteCameraData() {
    const connection = await getConnection();
    try {
      const result = await connection.query(`SELECT 
    p.id AS parametro_id,
    p.nombre AS parametro_nombre,
    p.descripcion,
    v.id AS valor_id,
    v.valor,
    v.precio
    FROM 
    parametros_camaras p
    LEFT JOIN 
    valores_parametro_camaras v ON p.id = v.parametro_id
    ORDER BY 
    p.id, v.id;
        `);

      return result[0];
    } catch (error) {
      console.error("Error in getQuoteCameraData:", error);
      throw error;
    }
  }

  async updateCameraParameter(id, cameraData) {
    const connection = await getConnection();
    const query = `UPDATE ?? SET valor = ?, precio = ? WHERE id = ?`;

    try {
      const result = await connection.query(query, [
        this.valores_parametro_camaras,
        cameraData.valor,
        cameraData.precio,
        id,
      ]);

      if (result[0].affectedRows === 0) {
        return {
          errorMessage: `No se encontró el parámetro con ID ${id}`,
          success: false,
        };
      }
      return {
        successMessage: `Parámetro actualizado correctamente`,
        affectedRows: result[0].affectedRows,
        success: true,
      };
    } catch (error) {
      console.log(`Error in try update camera parameter ${error}`);
      throw error;
    }
  }

  async deleteCameraParameter(id) {
    const connection = await getConnection();
    const query = `DELETE FROM ?? WHERE id = ?`;

    try {
      const result = await connection.query(query, [
        this.valores_parametro_camaras,
        id,
      ]);

      if (result[0].affectedRows === 0) {
        return {
          errorMessage: `No se encontró el parámetro con ID ${id}`,
          success: false,
        };
      }
      return {
        successMessage: `Parámetro eliminado correctamente`,
        affectedRows: result[0].affectedRows,
        success: true,
      };
    } catch (error) {
      console.log(`Error in delete camera parameter ${error}`);
      throw error;
    }
  }

  async getIdCameraParameterByName(name, description) {
    const connection = await getConnection();
    const query = `SELECT id FROM ?? WHERE nombre = ? AND descripcion = ?`;

    try {
      const result = await connection.query(query, [
        this.parametros_camaras,
        name,
        description,
      ]);
      if (result[0].length === 0) {
        return null;
      }
      return result[0][0].id;
    } catch (error) {
      console.error(`Error in getIdCameraParameterByName: ${error}`);
      throw error;
    }
  }

  async addCameraParameter(id, data) {
    const connection = await getConnection();
    const query = `INSERT INTO ?? (parametro_id, valor, precio) VALUES (?, ? ,? );`;

    // console.log(data);
    
    try {
      const result = await connection.query(query, [
        this.valores_parametro_camaras,
        id,
        data.valor,
        data.precio,
      ]);

      if (result[0].affectedRows === 0) {
        return {
          errorMessage: `No se pudo agregar el parámetro con ID ${id}`,
          success: false,
        };
      }
      return {
        successMessage: `Parámetro agregado correctamente`,
        affectedRows: result[0].affectedRows,
        success: true,
      };


    } catch (error) {
      console.error(`Error in addCameraParameter: ${error}`);
      throw error;
    }
  }
}

export default new QuoterModel();
