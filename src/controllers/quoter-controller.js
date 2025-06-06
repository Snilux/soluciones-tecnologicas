import QuoterModel from "../models/quoter-model.js";
import {
  validateQuoterCamera,
  validateQuoterParameter,
} from "../schemas/users.js";

class QuoterController {
  async quoterCameraAdmin(req, res) {
    try {
      const quoterCameraData = await QuoterModel.getQuoteCameraData();

      const groupedData = {};
      quoterCameraData.forEach((item) => {
        const key = item.parametro_id;
        if (!groupedData[key]) {
          groupedData[key] = {
            parametro_nombre: item.parametro_nombre,
            descripcion: item.descripcion,
            items: [],
          };
        }
        groupedData[key].items.push(item);
      });

      const groupedDataArray = Object.values(groupedData);

      if (quoterCameraData.length === 0) {
        return res.status(404).json({
          message: "No se encontrarón los datos de cotización de cámaras",
        });
      }
      // console.log(quoterCameraData);

      return res.render("admin/quoter-cameras", {
        tittle: "Datos de cotización de cámaras",
        groupedData: groupedDataArray,
      });
    } catch (error) {
      console.log(`Error in quoterCamera ${error}`);
      throw error;
    }
  }

  async addCameraParameter(req, res) {
    const cameraParameter = validateQuoterParameter(req.body);

    if (!cameraParameter.success) {
      const errors = cameraParameter.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });

      return res.status(400).json({
        errorMessage: `Error en la validación de los datos \n`,
        errors: errors || "Datos inválidos",
      });
    }
    const { parametro_nombre, descripcion } = cameraParameter.data;

    const id = await QuoterModel.getIdCameraParameterByName(
      parametro_nombre,
      descripcion
    );

    if (!id) {
      return res.status(404).json({
        errorMessage: `No se encontró el parámetro con el nombre ${cameraParameter.parametro_nombre} y descripción ${cameraParameter.descripcion}`,
      });
    }

    try {
      const result = await QuoterModel.addCameraParameter(
        id,
        cameraParameter.data
      );

      if (!result.success) {
        return res.status(404).json({
          errorMessage: result.errorMessage,
        });
      }

      return res.status(201).json({
        successMessage: result.successMessage,
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.log(`Error in addCameraParameter ${error}`);
      return res.status(500).json({
        errorMessage: `Error al agregar el parámetro`,
      });
    }
  }

  async updateCameraParameter(req, res) {
    const { id } = req.params;

    const cameraParameter = validateQuoterCamera(req.body);

    if (!cameraParameter.success) {
      const errors = cameraParameter.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });

      return res.status(400).json({
        errorMessage: `Error en la validación de los datos \n`,
        errors: errors || "Datos inválidos",
      });
    }

    try {
      const updatedCameraParameter = await QuoterModel.updateCameraParameter(
        id,
        cameraParameter.data
      );
      console.log(updatedCameraParameter);

      if (!updatedCameraParameter.success) {
        return res.status(404).json({
          errorMessage: updatedCameraParameter.errorMessage,
        });
      }

      return res.status(200).json({
        successMessage: updatedCameraParameter.successMessage,
        affectedRows: updatedCameraParameter.affectedRows,
      });
    } catch (error) {
      console.log(`Error in updateCameraParameter ${error}`);
      return res.status(500).json({
        errorMessage: `Error al actualizar el parámetro de la camara`,
      });
    }
  }

  async deleteCameraParameter(req, res) {
    const { id } = req.params;
    try {
      const result = await QuoterModel.deleteCameraParameter(id);
      if (result.affectedRows === 0) {
        return res.status(404).json({
          errorMessage: `No se encontró el parámetro con ID ${id}`,
        });
      }
      return res.status(200).json({
        successMessage: `Parámetro eliminado correctamente`,
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.log(`Error in deleteCameraParameter ${error}`);
      return res.status(500).json({
        errorMessage: `Error al eliminar el parámetro de la cámara`,
      });
    }
  }
}

export default new QuoterController();
