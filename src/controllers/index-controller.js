import IndexModel from "../models/index-model.js";
import QuoterModel from "../models/quoter-model.js";

class indexController {
  async renderIndex(req, res) {
    res.render("index/index");
  }

  async getDataCameras(req, res) {
    const quoterCameraData = await QuoterModel.getQuoteCameraData();

    if (quoterCameraData.length === 0 || !quoterCameraData) {
      return res.status(404).json({
        message: "No se encontrarón los datos de cotización de cámaras",
      });
    }

    const groupedData = {};
    quoterCameraData.forEach((item) => {
      const key = item.parametro_id;
      if (!groupedData[key]) {
        groupedData[key] = {
          parametro_id: item.parametro_id,
          parametro_nombre: item.parametro_nombre,
          descripcion: item.descripcion,
          items: [],
        };
      }
      groupedData[key].items.push(item);
    });

    //Make a array
    const groupedDataArray = Object.values(groupedData);

    // console.log(groupedDataArray[0]);

    if (!groupedDataArray) {
      return res.render("index", {
        tittle: "Soluciones tecnologicas",
      });
    }

    return res.render("index/quoter-cameras", {
      tittle: "Cotizador de camaras",
      cameraData: groupedDataArray,
    });
  }

  async calculatePriceCameras(req, res) {
    try {
      // Fetch necessary data from models.
      const drvData = await QuoterModel.getDrvData(); // Data for DVRs, currently not used in final price calculation.
      const quoterData = await QuoterModel.getQuoteCameraData(); // All configurable pricing data from the DB.

      // Define parameters to filter from quoterData to create lookup maps.
      const paramsToFilter = [
        "Precio cable interior",
        "Precio cable exterior", // Keep this for filtering, even if not directly used as base for CamsxCable
        "Disco duro recomendado",
        "Altura instalación", // Corrected parameter name for height installation prices
        "Lugar instalación", // Filtering for prices associated with 'Lugar instalación' (Interior/Exterior).
      ];
      const filterData = quoterData.filter((item) =>
        paramsToFilter.includes(item.parametro_nombre)
      );

      // Prepare lookup maps from filterData for easier access to prices.
      const discPrices = {};
      const cableInteriorPrices = {};
      const cableExteriorPrices = {}; // Will be populated but not used as the base in CamsxCable calculation
      const alturaPrices = {}; // Map for "Altura instalación" prices.
      const lugarInstalacionPrices = {}; // Map for "Lugar instalación" prices (e.g., Exterior surcharge).

      filterData.forEach((item) => {
        if (item.parametro_nombre === "Disco duro recomendado") {
          discPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Precio cable interior") {
          cableInteriorPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Precio cable exterior") {
          cableExteriorPrices[item.valor] = parseFloat(item.precio); // Populating this map
        } else if (item.parametro_nombre === "Altura instalación") {
          // Corrected condition
          alturaPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Lugar instalación") {
          lugarInstalacionPrices[item.valor] = parseFloat(item.precio);
        }
      });

      // Add detailed logs for populated price maps
      console.log("DEBUG: discPrices:", discPrices);
      console.log("DEBUG: cableInteriorPrices:", cableInteriorPrices);
      console.log("DEBUG: cableExteriorPrices:", cableExteriorPrices);
      console.log("DEBUG: alturaPrices:", alturaPrices); // This should now be populated
      console.log("DEBUG: lugarInstalacionPrices:", lugarInstalacionPrices);

      // Added warnings if critical price maps are empty based on user's debug logs.
      if (Object.keys(alturaPrices).length === 0) {
        console.warn(
          "WARNING: El mapa 'alturaPrices' está vacío. Asegúrate de que 'QuoterModel.getQuoteCameraData()' esté retornando datos para 'Altura instalación'."
        );
      }
      if (Object.keys(lugarInstalacionPrices).length === 0) {
        console.warn(
          "WARNING: El mapa 'lugarInstalacionPrices' está vacío. Asegúrate de que 'QuoterModel.getQuoteCameraData()' esté retornando datos para 'Lugar instalación'."
        );
      }

      // Extract user selections from the request body.
      const dataPrice = req.body;

      // Ensure that the 'valor' property exists and parse it correctly.
      const CantiCams = parseInt(dataPrice["Cantidad de cámaras"]?.valor);
      const LugarInstala = dataPrice["Lugar instalación"]?.valor;
      const DistanciaCamsGrab = dataPrice["Distancia cableado"]?.valor;
      const AlturaCams = dataPrice["Altura instalación"]?.valor;
      const MegaPixCamsRaw = dataPrice["Resolución de cámara"]?.valor;
      const MegaPixCams =
        MegaPixCamsRaw === "Otro"
          ? "Otro"
          : parseInt(MegaPixCamsRaw?.replace("MP", ""));
      const DiaGrab = parseInt(dataPrice["Días de grabación"]?.valor);

      // Log received data for debugging purposes
      console.log("dataPrice (received):", dataPrice);
      console.log("drvData (from QuoterModel):", drvData);
      console.log("filterData (from QuoterModel, filtered):", filterData);
      console.log("Extracted Inputs:", {
        CantiCams,
        LugarInstala,
        DistanciaCamsGrab,
        AlturaCams,
        MegaPixCams,
        DiaGrab,
      });
      // Removed the previous "Parsed Prices" log as detailed logs are now above.

      // --- Check for "Otro" selections which require specialization ---
      const isSpecialized =
        dataPrice["Cantidad de cámaras"]?.valor === "Otro" ||
        LugarInstala === "Otro" ||
        DistanciaCamsGrab === "Otro" ||
        AlturaCams === "Otro" ||
        MegaPixCamsRaw === "Otro";

      if (isSpecialized) {
        return res.status(200).json({
          "Precio estimado": "Requiere más especialización",
          "Tamaño disco duro": "N/A",
        });
      }

      let PrecioCams = 0;
      let CamsxCable = 0;
      let AlturaxCams = 0;
      let CantidadPxCam = 0;
      let TamañoDiscFinal = "N/A";

      // --- 1. Calculate CamsxCable (Costo de Cableado e Instalación por Distancia y Lugar) ---
      // As per original cotizador's logic, the base cable cost is derived from interior prices,
      // and an additional surcharge is added for exterior installation.
      let baseCableCostPerCam = cableInteriorPrices[DistanciaCamsGrab] || 0;
      console.log(
        `DEBUG: baseCableCostPerCam for ${DistanciaCamsGrab}: ${baseCableCostPerCam}`
      );

      CamsxCable = CantiCams * baseCableCostPerCam;
      console.log(
        `DEBUG: CamsxCable after base calculation (${CantiCams} * ${baseCableCostPerCam}): ${CamsxCable}`
      );

      // Add the cost specific to the installation location (Interior/Exterior) from DB.
      // This acts as the "surcharge" for exterior installation, matching original behavior.
      if (LugarInstala === "Exterior") {
        const lugarInstalacionCost = lugarInstalacionPrices[LugarInstala] || 0; // Should be 100.00 for "Exterior"
        console.log(
          `DEBUG: lugarInstalacionCost for ${LugarInstala}: ${lugarInstalacionCost}`
        );
        CamsxCable += CantiCams * lugarInstalacionCost;
        console.log(
          `DEBUG: CamsxCable after exterior surcharge (${CantiCams} * ${lugarInstalacionCost}): ${CamsxCable}`
        );
      }

      // --- 2. Calculate AlturaxCams (Costo de Instalación por Altura) ---
      if (AlturaCams === "0-1mts") {
        AlturaxCams = 0;
        console.log(`DEBUG: AlturaxCams for ${AlturaCams}: ${AlturaxCams}`);
      } else {
        // Now, priceForHeight should be correctly retrieved from alturaPrices
        const priceForHeight = alturaPrices[AlturaCams] || 0;
        console.log(
          `DEBUG: priceForHeight for ${AlturaCams}: ${priceForHeight}`
        );
        AlturaxCams = CantiCams * priceForHeight;
        console.log(
          `DEBUG: AlturaxCams after calculation (${CantiCams} * ${priceForHeight}): ${AlturaxCams}`
        );
      }

      // --- 3. Determine HDD Price and Size based on CantiCams, DiaGrab, MegaPixCams ---
      let PrecioDiscSelected = 0;
      let TamañoDiscSelected = "";

      // Dynamic HDD pricing table (HDDRecommendationMap)
      const hddRecommendationMap = {
        4: {
          11: { 2: "1 TB", 5: "3 TB", 8: "4 TB" },
          22: { 2: "2 TB", 5: "6 TB", 8: "8 TB" },
        },
        8: {
          11: { 2: "2 TB", 5: "6 TB", 8: "8 TB" },
          22: { 2: "4 TB", 5: "10 TB", 8: "10 TB" },
        },
        16: {
          11: { 2: "4 TB", 5: "10 TB", 8: "10 TB" },
          22: { 2: "8 TB", 5: "10 TB", 8: "10 TB" },
        },
      };

      TamañoDiscSelected =
        hddRecommendationMap[CantiCams]?.[DiaGrab]?.[MegaPixCams];
      console.log(`DEBUG: TamañoDiscSelected from map: ${TamañoDiscSelected}`);

      if (TamañoDiscSelected && discPrices[TamañoDiscSelected]) {
        PrecioDiscSelected = discPrices[TamañoDiscSelected];
        console.log(
          `DEBUG: PrecioDiscSelected for ${TamañoDiscSelected}: ${PrecioDiscSelected}`
        );
      } else {
        console.warn(
          `No se encontró precio para el disco duro: ${TamañoDiscSelected}`
        );
      }
      TamañoDiscFinal = TamañoDiscSelected;

      // --- 4. Calculate CantidadPxCam (Costo de Cámaras + Disco Duro) ---
      const cameraBasePrice = dataPrice["Resolución de cámara"]?.precio || 0;
      console.log(`DEBUG: cameraBasePrice: ${cameraBasePrice}`);

      CantidadPxCam = cameraBasePrice * CantiCams + PrecioDiscSelected;
      console.log(`DEBUG: CantidadPxCam: ${CantidadPxCam}`);

      // --- Final Calculation ---
      PrecioCams = CantidadPxCam + CamsxCable + AlturaxCams;
      console.log(
        `DEBUG: Final PrecioCams: ${CantidadPxCam} + ${CamsxCable} + ${AlturaxCams} = ${PrecioCams}`
      );

      return res.status(200).json({
        "Precio estimado": PrecioCams.toFixed(2),
        "Tamaño disco duro": TamañoDiscFinal,
        "Resumen de precios": {
          "Costo de Cámaras y Disco Duro": CantidadPxCam.toFixed(2),
          "Costo de Cableado": CamsxCable.toFixed(2),
          "Costo de Instalación por Altura": AlturaxCams.toFixed(2),
        },
      });
    } catch (error) {
      console.error("Error calculating camera price:", error);
      return res.status(500).json({
        error: "Error al calcular el precio estimado.",
        details: error.message,
      });
    }
  }
}

export default new indexController();
