import QuoterModel from "../models/quoter-model.js";

class QuoterController {
  async quoterCamera(req, res) {
    try {
      const quoterCameraData = await QuoterModel.getQuoteCameraData();
      if (quoterCameraData.length === 0) {
        return res
          .status(404)
          .json({
            message: "No se encontrarón los datos de cotización de cámaras",
          });
      }

      return res.status(200).json(quoterCameraData);

      
    } catch (error) {
      console.log(`Error in quoterCamera ${error}`);
      throw error;
    }
  }
}

export default new QuoterController();
