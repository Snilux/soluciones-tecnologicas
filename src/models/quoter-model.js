import getConnection from "../db.js";

class QuoterModel {
  constructor() {
    this.valores_parametro_camaras = "valores_parametro_camaras";
    this.parametros_camaras = "parametros_camaras";
    this.drv = "drv";

    this.parametros_cercado = "parametros_cercado";
    this.valores_parametro_cercado = "valores_parametro_cercado";
  }

  async getQuoteCameraData() {
    const connection = await getConnection();
    // Query to get camera parameters and their values
    const queryCameraData = `SELECT 
      p.id AS parametro_id,
      p.nombre AS parametro_nombre,
      p.descripcion,
      v.id AS valor_id,
      v.valor,
      v.precio
      FROM 
      ${this.parametros_camaras} p
      LEFT JOIN 
      ${this.valores_parametro_camaras} v ON p.id = v.parametro_id
      ORDER BY 
      p.id, v.id;`;

    try {
      const result = await connection.query(queryCameraData);

      return result[0];
    } catch (error) {
      console.error("Error in getQuoteCameraData:", error);
      throw error;
    }
  }

  async getDrvData() {
    //Query for get data of drv
    const queryDataDrv = `SELECT * FROM ??`;
    const connection = await getConnection();

    try {
      const drvData = await connection.query(queryDataDrv, [this.drv]);
      return drvData[0];
    } catch (error) {
      console.log(`Error el get drv data ${error}`);
      throw error;
    }
  }

  async updateCameraParameter(id, cameraData, table) {
    let params = [];
    if (table === "fence") {
      params = [
        this.valores_parametro_cercado,
        cameraData.valor,
        cameraData.precio,
        id,
      ];
    } else if (table === "camera") {
      params = [
        this.valores_parametro_camaras,
        cameraData.valor,
        cameraData.precio,
        id,
      ];
    } else {
      return {
        errorMessage: `No se encontró la tabla ${table}`,
        success: false,
      };
    }

    const connection = await getConnection();
    const query = `UPDATE ?? SET valor = ?, precio = ? WHERE id = ?`;

    try {
      const result = await connection.query(query, params);

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

  async deleteCameraParameter(id, table) {
    let params = [];
    if (table === "camera") {
      params = [this.valores_parametro_camaras, id];
    } else if (table === "fence") {
      params = [this.valores_parametro_cercado, id];
    } else {
      return {
        errorMessage: `No se encontró la tabla ${table}`,
        success: false,
      };
    }

    const connection = await getConnection();
    const query = `DELETE FROM ?? WHERE id = ?`;

    try {
      const result = await connection.query(query, params);

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

  async getIdCameraParameterByName(name, description, table) {
    let params = [];
    if (table === "fences") {
      params = [this.parametros_cercado, name, description];
    } else if (table === "cameras") {
      params = [this.parametros_camaras, name, description];
    } else {
      return {
        errorMessage: `No se encontró la tabla ${table}`,
        success: false,
      };
    }
    const connection = await getConnection();
    const query = `SELECT id FROM ?? WHERE nombre = ? AND descripcion = ?`;

    try {
      const result = await connection.query(query, params);
      if (result[0].length === 0) {
        return null;
      }
      return result[0][0].id;
    } catch (error) {
      console.error(`Error in getIdCameraParameterByName: ${error}`);
      throw error;
    }
  }

  async addCameraParameter(id, data, table) {
    let params = [];
    if (table === "fence") {
      params = [this.valores_parametro_cercado, id, data.valor, data.precio];
    } else if (table === "camera") {
      params = [this.valores_parametro_camaras, id, data.valor, data.precio];
    } else {
      return {
        errorMessage: `No se encontró la tabla ${table}`,
        success: false,
      };
    }

    const connection = await getConnection();
    const query = `INSERT INTO ?? (parametro_id, valor, precio) VALUES (?, ? ,? );`;

    // console.log(data);

    try {
      const result = await connection.query(query, params);

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

  async deleteCameraDrvOption(id) {
    const connection = await getConnection();
    const query = `DELETE FROM ?? WHERE id = ?`;

    try {
      const result = await connection.query(query, [this.drv, id]);

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
      console.log(`Error in model trying delete drv ${error}`);
      throw error;
    }
  }

  async addCameraDrvOption(data) {
    const connection = await getConnection();
    const query = `INSERT INTO ?? (mp, canales, precio) VALUES (? ,? ,? )`;
    const { mp, canales, precio } = data;

    try {
      const response = await connection.query(query, [
        this.drv,
        mp,
        canales,
        precio,
      ]);

      if (response[0].affectedRows === 0) {
        return {
          errorMessage: `No se pudo agregar la opcion de dvr`,
          success: false,
        };
      }
      return {
        successMessage: `Parámetro agregado correctamente`,
        affectedRows: response[0].affectedRows,
        success: true,
      };
    } catch (error) {
      console.log(`Error in model trying insert drv option ${error}`);
      throw error;
    }
  }

  async updateCameraDrvOption(id, data) {
    const connection = await getConnection();
    const query = `UPDATE ?? SET mp = ?, canales = ?, precio = ? WHERE id = ?`;

    try {
      const result = await connection.query(query, [
        this.drv,
        data.mp,
        data.canales,
        data.precio,
        id,
      ]);

      if (result[0].affectedRows === 0) {
        return {
          errorMessage: `No se encontró el drv con ID ${id}`,
          success: false,
        };
      }
      return {
        successMessage: `Drv actualizado correctamente`,
        affectedRows: result[0].affectedRows,
        success: true,
      };
    } catch (error) {
      console.log(`Error in try update camera parameter ${error}`);
      throw error;
    }
  }

  async getQuoteFenceData() {
    const connection = await getConnection();
    const queryCameraData = `SELECT 
      p.id AS parametro_id,
      p.nombre AS parametro_nombre,
      p.descripcion,
      v.id AS valor_id,
      v.valor,
      v.precio
      FROM 
      ${this.parametros_cercado} p
      LEFT JOIN 
      ${this.valores_parametro_cercado} v ON p.id = v.parametro_id
      ORDER BY 
      p.id, v.id;`;

    try {
      const result = await connection.query(queryCameraData);

      return result[0];
    } catch (error) {
      console.error("Error in getQuoteCameraData:", error);
      throw error;
    }
  }

}

export default new QuoterModel();
