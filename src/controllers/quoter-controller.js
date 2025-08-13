import QuoterModel from "../models/quoter-model.js";
import {
  validateQuoterCamera,
  validateQuoterParameter,
  validateParameterDrv,
} from "../schemas/users.js";

class QuoterController {
  async quoterCameraAdmin(req, res) {
    try {
      const quoterCameraData = await QuoterModel.getQuoteCameraData();

      if (quoterCameraData.length === 0) {
        return res.status(404).json({
          message: "No se encontrarón los datos de cotización de cámaras",
        });
      }
      // Fetching drv data
      const drvData = await QuoterModel.getDrvData();

      // Grouping the data by parametro_id
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

      //Make a array
      const groupedDataArray = Object.values(groupedData);
      // console.log(drvData);

      return res.render("admin/quoter-cameras", {
        tittle: "Datos de cotización de cámaras",
        groupedData: groupedDataArray,
        drvData: drvData,
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
      descripcion,
      "cameras"
    );

    if (!id) {
      return res.status(404).json({
        errorMessage: `No se encontró el parámetro con el nombre ${cameraParameter.parametro_nombre} y descripción ${cameraParameter.descripcion}`,
      });
    }

    try {
      const result = await QuoterModel.addCameraParameter(
        id,
        cameraParameter.data,
        "camera"
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
        cameraParameter.data,
        "camera"
      );

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
      const result = await QuoterModel.deleteCameraParameter(id, "camera");
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

  async deleteCameraDrvOption(req, res) {
    const { id } = req.params;
    console.log(id);

    try {
      const result = await QuoterModel.deleteCameraDrvOption(id);

      if (result.affectedRows === 0 || !result) {
        return res.status(404).json({
          errorMessage: `No se encontró el drv con ID ${id}`,
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

  async addCameraDrvOption(req, res) {
    console.log(req.body);
    const dataDrv = validateParameterDrv(req.body);

    console.log(dataDrv);

    if (!dataDrv.success) {
      const errors = dataDrv.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });

      return res.status(400).json({
        errorMessage: `Error en la validación de los datos \n`,
        errors: errors || "Datos inválidos",
      });
    }

    try {
      const response = await QuoterModel.addCameraDrvOption(dataDrv.data);

      if (!response.success) {
        return res.status(404).json({
          errorMessage: response.errorMessage,
        });
      }

      return res.status(201).json({
        successMessage: response.successMessage,
        affectedRows: response.affectedRows,
      });
    } catch (error) {
      console.log(`Error in addCameraParameter ${error}`);
      return res.status(500).json({
        errorMessage: `Error al agregar el parámetro`,
      });
    }
  }

  async updateCameraDrvOption(req, res) {
    const { id } = req.params;

    const drvData = validateParameterDrv(req.body);

    if (!drvData.success) {
      const errors = drvData.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });

      return res.status(400).json({
        errorMessage: `Error en la validación de los datos \n`,
        errors: errors || "Datos inválidos",
      });
    }

    try {
      const updatedDrvParameter = await QuoterModel.updateCameraDrvOption(
        id,
        drvData.data
      );
      console.log(updatedDrvParameter);

      if (!updatedDrvParameter.success) {
        return res.status(404).json({
          errorMessage: updatedDrvParameter.errorMessage,
        });
      }

      return res.status(200).json({
        successMessage: updatedDrvParameter.successMessage,
        affectedRows: updatedDrvParameter.affectedRows,
      });
    } catch (error) {
      console.log(`Error in updateCameraParameter ${error}`);
      return res.status(500).json({
        errorMessage: `Error al actualizar el parámetro de la camara`,
      });
    }
  }

  async quoterFenceAdmin(req, res) {
    try {
      const quoterCameraData = await QuoterModel.getQuoteFenceData();

      if (quoterCameraData.length === 0) {
        return res.status(404).json({
          message: "No se encontrarón los datos de cotización de cercado",
        });
      }

      // Grouping the data by parametro_id
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

      //Make a array
      const groupedDataArray = Object.values(groupedData);

      return res.render("admin/quoter-fences", {
        tittle: "Datos de cotización de cámaras",
        groupedData: groupedDataArray,
      });
    } catch (error) {
      console.log(`Error in quoterCamera ${error}`);
      throw error;
    }
  }

  async addFenceParameter(req, res) {
    const fenceParameter = validateQuoterParameter(req.body);

    if (!fenceParameter.success) {
      const errors = fenceParameter.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });

      return res.status(400).json({
        errorMessage: `Error en la validación de los datos \n`,
        errors: errors || "Datos inválidos",
      });
    }
    const { parametro_nombre, descripcion } = fenceParameter.data;

    const id = await QuoterModel.getIdCameraParameterByName(
      parametro_nombre,
      descripcion,
      "fences"
    );

    if (!id) {
      return res.status(404).json({
        errorMessage: `No se encontró el parámetro con el nombre ${fenceParameter.parametro_nombre} y descripción ${fenceParameter.descripcion}`,
      });
    }

    try {
      const result = await QuoterModel.addCameraParameter(
        id,
        fenceParameter.data,
        "fence"
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

  async updateFenceParameter(req, res) {
    const { id } = req.params;
    const fenceParameter = validateQuoterCamera(req.body);

    if (!fenceParameter.success) {
      const errors = fenceParameter.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });

      return res.status(400).json({
        errorMessage: `Error en la validación de los datos \n`,
        errors: errors || "Datos inválidos",
      });
    }

    try {
      const updatedFenceParameter = await QuoterModel.updateCameraParameter(
        id,
        fenceParameter.data,
        "fence"
      );

      if (!updatedFenceParameter.success) {
        return res.status(404).json({
          errorMessage: updatedFenceParameter.errorMessage,
        });
      }

      return res.status(200).json({
        successMessage: updatedFenceParameter.successMessage,
        affectedRows: updatedFenceParameter.affectedRows,
      });
    } catch (error) {
      console.log(`Error in update fence parameter ${error}`);
      return res.status(500).json({
        errorMessage: "Error al actualizar el parametro de cercado",
      });
    }
  }

  async deleteFenceParameter(req, res) {
    const { id } = req.params;
    try {
      const result = await QuoterModel.deleteCameraParameter(id, "fence");
      if (result.affectedRows === 0) {
        return res.status(404).json({
          errorMessage: `No se encontró el parámetro con ID ${id}`,
        });
      }

      return res.status(200).json({
        successMessage: "Parametro eliminado correctamente",
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.log(`Error in deleteCameraParameter ${error}`);
      return res.status(500).json({
        errorMessage: `Error al eliminar el parámetro del cercado`,
      });
    }
  }

  async quoterPanelsAdmin(req, res) {
    try {
      const panelsData = await QuoterModel.getQuotePanelData();

      if (panelsData.length === 0) {
        return res.render("admin/quoter-panels", {
          tittle: "Datos de cotización de paneles",
          panelsData: [],
        });
      }

      const groupedData = {};
      panelsData.forEach((item) => {
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

      //Make a array
      const groupedDataArray = Object.values(groupedData);

      return res.render("admin/quoter-panels", {
        tittle: "Datos de cotización de paneles",
        groupedData: groupedDataArray,
      });
    } catch (error) {
      console.log(`Error in deleteCameraParameter ${error}`);
      return res.render("error", {
        tittle: "Error",
      });
    }
  }

  async addPanelParameter(req, res) {
    const panelParameter = validateQuoterParameter(req.body);

    if (!panelParameter.success) {
      const errors = panelParameter.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });

      return res.status(400).json({
        errorMessage: `Error en la validación de los datos \n`,
        errors: errors || "Datos inválidos",
      });
    }
    const { parametro_nombre, descripcion } = panelParameter.data;

    const id = await QuoterModel.getIdCameraParameterByName(
      parametro_nombre,
      descripcion,
      "panels"
    );

    if (!id) {
      return res.status(404).json({
        errorMessage: `No se encontró el parámetro con el nombre ${panelParameter.parametro_nombre} y descripción ${panelParameter.descripcion}`,
      });
    }

    try {
      const result = await QuoterModel.addCameraParameter(
        id,
        panelParameter.data,
        "panel"
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

  async updatePanelParameter(req, res) {
    console.log(req.body);

    const { id } = req.params;
    const panelParameter = validateQuoterCamera(req.body);
    if (!panelParameter.success) {
      const errors = panelParameter.error.errors.map((err) => {
        const field = err.path.join(".");
        return `${field}: ${err.message}`;
      });

      return res.status(400).json({
        errorMessage: `Error en la validación de los datos \n`,
        errors: errors || "Datos inválidos",
      });
    }

    try {
      const updatedPanelParameter = await QuoterModel.updateCameraParameter(
        id,
        panelParameter.data,
        "panel"
      );

      if (!updatedPanelParameter.success) {
        return res.status(404).json({
          errorMessage: updatedPanelParameter.errorMessage,
        });
      }

      return res.status(200).json({
        successMessage: updatedPanelParameter.successMessage,
        affectedRows: updatedPanelParameter.affectedRows,
      });
    } catch (error) {
      console.log(`Error in update panel parameter ${error}`);
      return res.status(500).json({
        errorMessage: "Error al actualizar el parametro de panel",
      });
    }
  }

  async deletePanelParameter(req, res) {
    const { id } = req.params;
    try {
      const result = await QuoterModel.deleteCameraParameter(id, "panel");
      if (result.affectedRows === 0) {
        return res.status(404).json({
          errorMessage: `No se encontró el parámetro con ID ${id}`,
        });
      }

      return res.status(200).json({
        successMessage: "Parametro eliminado correctamente",
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.log(`Error in deletePanelParameter ${error}`);
      return res.status(500).json({
        errorMessage: `Error al eliminar el parámetro de panel `,
      });
    }
  }
}

export default new QuoterController();
