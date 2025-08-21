import QuoterSavesModel from "../models/quoter-saves-model.js";

class QuoterSavesController {
  async getCostumersWithQuotes(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // o configurable

      const costumers = await QuoterSavesModel.getDataQuoterSavesForUsers(
        page,
        limit
      );

      if (!costumers) {
        return res.render("admin/quoter-saves-costumers", {
          tittle: "Cotizaciones de usuarios",
          costumers: [],
          totalPages: 0,
          currentPage: 0,
          message: "No hay usuarios disponibles",
        });
      }

      // console.log(costumers);

      return res.render("admin/quoter-saves-costumers", {
        tittle: "Cotizaciones de usuarios",
        costumers: costumers.costumers,
        totalPages: costumers.totalPages,
        currentPage: costumers.currentPage,
        message: "",
      });
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async deleteCostumerAndQuote(req, res) {
    const id = req.params.id;

    try {
      const result = await QuoterSavesModel.deleteCostumerAndQuote(id);

      if (result.success === false) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({
        success: true,
        successMessage: result.message || "Cotización eliminada correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar la cotización:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async getQuotesOfCamera(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // o configurable

      const dataQuotes = await QuoterSavesModel.getDataQuotesOfCameras(
        page,
        limit,
        "camera"
      );

      if (!dataQuotes || dataQuotes.data.length === 0) {
        // Si no hay cotizaciones, renderiza la vista con un mensaje
        return res.render("admin/quoter-saves-cameras", {
          tittle: "Cotizaciones de usuarios",
          data: [],
          totalPages: 0,
          currentPage: 0,
          message: "No hay cotizaciones disponibles", // Agregar un mensaje
        });
      }

      return res.render("admin/quoter-saves-cameras", {
        tittle: "Cotizaciones de usuarios",
        data: dataQuotes.data,
        totalPages: dataQuotes.totalPages,
        currentPage: dataQuotes.currentPage,
        message: "",
      });
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async getQuoteCamerasById(req, res) {
    const id = req.params.id;
    const idCostumer = req.params.idCostumer;

    try {
      const quoteCamera = await QuoterSavesModel.getQuoteById(
        id,
        idCostumer,
        "camera"
      );

      if (!quoteCamera) {
        res.redirect("/admin/saves");
        return;
      }

      return res.render("admin/quoter-camera-modal", {
        tittle: "Cotización de cámaras",
        data: quoteCamera,
      });
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async deleteQuoteCamera(req, res) {
    const { id } = req.params;

    try {
      const result = await QuoterSavesModel.deleteQuote(id, "camera");
      if (result.affectedRows === 0) {
        return res.status(404).json({
          errorMessage: `No se encontró la cotización con ID ${id}`,
        });
      }
      return res.status(200).json({
        successMessage: `Cotización eliminado correctamente`,
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.log(`Error in delete camera quote ${error}`);
      return res.status(500).json({
        errorMessage: `Error al eliminar el parámetro de la cámara`,
      });
    }
  }

  async getQuotesOfFence(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // o configurable

      const dataQuotes = await QuoterSavesModel.getDataQuotesOfCameras(
        page,
        limit,
        "fence"
      );

      if (!dataQuotes || dataQuotes.data.length === 0) {
        // Si no hay cotizaciones, renderiza la vista con un mensaje
        return res.render("admin/quoter-saves-fences", {
          tittle: "Cotizaciones de usuarios",
          data: [],
          totalPages: 0,
          currentPage: 0,
          message: "No hay cotizaciones disponibles", // Agregar un mensaje
        });
      }

      console.log(dataQuotes);

      return res.render("admin/quoter-saves-fences", {
        tittle: "Cotizaciones de usuarios",
        data: dataQuotes.data,
        totalPages: dataQuotes.totalPages,
        currentPage: dataQuotes.currentPage,
        message: "",
      });
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async GetQuoteFencesById(req, res) {
    const id = req.params.id;
    const idCostumer = req.params.idCostumer;
    try {
      const quoteFence = await QuoterSavesModel.getQuoteById(
        id,
        idCostumer,
        "fence"
      );
      if (!quoteFence) {
        res.redirect("/admin/saves");
        return;
      }

      return res.render("admin/quoter-fence-modal", {
        tittle: "Cotización de cercas",
        data: quoteFence,
      });
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async deleteQuoteFence(req, res) {
    const { id } = req.params;

    try {
      const result = await QuoterSavesModel.deleteQuote(id, "fence");
      if (result.affectedRows === 0) {
        return res.status(404).json({
          errorMessage: `No se encontró la cotización con ID ${id}`,
        });
      }
      return res.status(200).json({
        successMessage: `Cotización eliminado correctamente`,
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.log(`Error in delete camera quote ${error}`);
      return res.status(500).json({
        errorMessage: `Error al eliminar el parámetro de la cámara`,
      });
    }
  }

  async getQuotesOfPanels(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // o configurable

      const dataQuotes = await QuoterSavesModel.getDataQuotesOfCameras(
        page,
        limit,
        "panel"
      );

      if (!dataQuotes || dataQuotes.data.length === 0) {
        // Si no hay cotizaciones, renderiza la vista con un mensaje
        return res.render("admin/quoter-saves-panels", {
          tittle: "Cotizaciones de usuarios",
          data: [],
          totalPages: 0,
          currentPage: 0,
          message: "No hay cotizaciones disponibles", // Agregar un mensaje
        });
      }

      return res.render("admin/quoter-saves-panels", {
        tittle: "Cotizaciones de usuarios",
        data: dataQuotes.data,
        totalPages: dataQuotes.totalPages,
        currentPage: dataQuotes.currentPage,
        message: "",
      });
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async deleteQuotePanel(req, res) {
    const { id } = req.params;

    try {
      const result = await QuoterSavesModel.deleteQuote(id, "panels");
      if (result.affectedRows === 0) {
        return res.status(404).json({
          errorMessage: `No se encontró la cotización con ID ${id}`,
        });
      }
      return res.status(200).json({
        successMessage: `Cotización eliminado correctamente`,
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.log(`Error in delete camera quote ${error}`);
      return res.status(500).json({
        errorMessage: `Error al eliminar el parámetro de la cámara`,
      });
    }
  }

  async GetQuotePanelsById(req, res) {
    const id = req.params.id;
    const idCostumer = req.params.idCostumer;

    try {
      const quotePanel = await QuoterSavesModel.getQuoteById(
        id,
        idCostumer,
        "panels"
      );
      if (!quotePanel) {
        res.redirect("/admin/saves");
        return;
      }
      console.log(quotePanel);

      return res.render("admin/quoter-panel-modal", {
        tittle: "Cotización de cercas",
        data: quotePanel,
      });
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async SearchUser(req, res) {
    console.log(req.query);
    const { searchType, searchValue } = req.query;
    const camposPermitidos = ["id", "telefono", "email"];
    if (!camposPermitidos.includes(searchType)) {
      throw new Error("Campo de búsqueda no válido");
    }

    const results = await QuoterSavesModel.searchUser(searchType, searchValue);
    console.log(results);

    if (results.success === false) {
      return res.render("admin/quoter-saves-costumers-search", {
        tittle: "Cotizaciones de usuarios",
        costumers: [],
        message: `No se ha encontrado ningun usuario con el ${searchType} ${searchValue}`,
      });
    }

    return res.render("admin/quoter-saves-costumers-search", {
      tittle: "Cotizaciones de usuarios",
      costumers: results.rows,
      message: "",
    });
  }
}

export default new QuoterSavesController();
