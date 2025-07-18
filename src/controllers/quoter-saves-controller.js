import QuoterSavesModel from "../models/quoter-saves-model.js";

class QuoterSavesController {
  constructor() {}

  async getCostumersWithQuotes(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // o configurable

      const costumers = await QuoterSavesModel.getDataQuoterSavesForUsers(
        page,
        limit
      );

      if (!costumers) {
        return res
          .status(404)
          .json({ message: "No hay cotizaciones disponibles" });
      }

      //   console.log(costumers);

      return res.render("admin/quoter-saves", {
        tittle: "Cotizaciones de usuarios",
        costumers: costumers.costumers,
        totalPages: costumers.totalPages,
        currentPage: costumers.currentPage,
      });
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async getQuoteCamerasById(req, res) {
    const id = req.params.id;

    try {
      const quoteCamera = await QuoterSavesModel.getQuoteCamerasById(id);

      if (!quoteCamera) {
        res.redirect("/admin/saves");
        return;
      }
      console.log(quoteCamera);

      return res.render("admin/quoter-camera-modal", {
        tittle: "Cotización de cámaras",
        quoteCamera: quoteCamera,
      });
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

export default new QuoterSavesController();
