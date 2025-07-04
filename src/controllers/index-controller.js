import QuoterModel from "../models/quoter-model.js";

class indexController {
  async renderIndex(req, res) {
    res.render("index/index", {
      tittle: "Soluciones tecnologicas .net",
    });
  }

  async renderContact(req, res) {
    return res.render("index/contact", {
      tittle: "Contactanos",
    });
  }

  async renderService(req, res) {
    return res.render("index/service", {
      tittle: "Nuestros servicios",
    });
  }
  async renderSupport(req, res) {
    return res.render("index/support", {
      tittle: "Nuestros servicios",
    });
  }

  async getDataCameras(req, res) {
    const quoterCameraData = await QuoterModel.getQuoteCameraData();

    if (quoterCameraData.length === 0 || !quoterCameraData) {
      return res.render("index", {
        tittle: "Soluciones tecnologicas",
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
        "Precio cable exterior",
        "Disco duro recomendado",
        "Altura instalación",
        "Lugar instalación",
      ];
      const filterData = quoterData.filter((item) =>
        paramsToFilter.includes(item.parametro_nombre)
      );

      // Prepare lookup maps from filterData for easier access to prices.
      const discPrices = {};
      const cableInteriorPrices = {};
      const cableExteriorPrices = {};
      const alturaPrices = {};
      const lugarInstalacionPrices = {};

      filterData.forEach((item) => {
        if (item.parametro_nombre === "Disco duro recomendado") {
          discPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Precio cable interior") {
          cableInteriorPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Precio cable exterior") {
          cableExteriorPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Altura instalación") {
          alturaPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Lugar instalación") {
          lugarInstalacionPrices[item.valor] = parseFloat(item.precio);
        }
      });

      // Add detailed logs for populated price maps
      // console.log("DEBUG: discPrices:", discPrices);
      // console.log("DEBUG: cableInteriorPrices:", cableInteriorPrices);
      // console.log("DEBUG: cableExteriorPrices:", cableExteriorPrices);
      // console.log("DEBUG: alturaPrices:", alturaPrices);
      // console.log("DEBUG: lugarInstalacionPrices:", lugarInstalacionPrices);

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
      // console.log("dataPrice (received):", dataPrice);
      // console.log("drvData (from QuoterModel):", drvData);
      // console.log("filterData (from QuoterModel, filtered):", filterData);
      // console.log("Extracted Inputs:", {
      //   CantiCams,
      //   LugarInstala,
      //   DistanciaCamsGrab,
      //   AlturaCams,
      //   MegaPixCams,
      //   DiaGrab,
      // });
      // Removed the previous "Parsed Prices" log as detailed logs are now above.

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
        const lugarInstalacionCost = lugarInstalacionPrices[LugarInstala] || 0;
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
      //--- 5. Response ---
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

  async getDataFences(req, res) {
    const quoterFenceData = await QuoterModel.getQuoteFenceData();

    if (quoterFenceData.length === 0 || !quoterFenceData) {
      return res.render("index", {
        tittle: "Soluciones tecnologicas",
      });
    }

    const groupedData = {};
    quoterFenceData.forEach((item) => {
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

    return res.render("index/quoter-fence", {
      tittle: "Cotizador de camaras",
      cameraData: groupedDataArray,
    });
  }

  async calculatePriceFences(req, res) {
    try {
      // Fetch configurable pricing data for electric fences from the DB.
      const fenceQuoterData = await QuoterModel.getQuoteFenceData(); // Assuming a new model method for fence data

      // Define parameters to filter from fenceQuoterData to create lookup maps.
      const paramsToFilter = [
        "Precio base del cercado",
        "Altura de instalacion",
        "Numero de bardas",
        "Distancia lineal",
        "Contacto cercano",
        "Control remoto",
      ];
      const filterData = fenceQuoterData.filter((item) =>
        paramsToFilter.includes(item.parametro_nombre)
      );

      // Prepare lookup maps from filterData for easier access to prices.
      let baseFencePrice = 0; // Initial base cost for the fence (from DB)
      const alturaBardaPrices = {}; // Map for prices based on wall height (from DB)
      const numeroBardasPrices = {}; // Map for prices based on number of walls (from DB)
      const metrosLinealesPrices = {}; // Map for prices based on linear meters (from DB)
      const contactoCercanoPrices = {}; // Map for prices related to electrical contact (from DB)
      const controlRemotoPrices = {}; // Map for prices related to remote control (from DB)

      filterData.forEach((item) => {
        if (item.parametro_nombre === "Precio base del cercado") {
          baseFencePrice = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Altura de instalacion") {
          alturaBardaPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Numero de bardas") {
          numeroBardasPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Distancia lineal") {
          metrosLinealesPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Contacto cercano") {
          contactoCercanoPrices[item.valor] = parseFloat(item.precio);
        } else if (item.parametro_nombre === "Control remoto") {
          controlRemotoPrices[item.valor] = parseFloat(item.precio);
        }
      });

      // Log populated price maps for debugging.
      console.log("DEBUG: baseFencePrice (from DB):", baseFencePrice);
      console.log("DEBUG: alturaBardaPrices (from DB):", alturaBardaPrices);
      console.log("DEBUG: numeroBardasPrices (from DB):", numeroBardasPrices);
      console.log(
        "DEBUG: metrosLinealesPrices (from DB):",
        metrosLinealesPrices
      );
      console.log(
        "DEBUG: contactoCercanoPrices (from DB):",
        contactoCercanoPrices
      );
      console.log("DEBUG: controlRemotoPrices (from DB):", controlRemotoPrices);

      // Extract user selections from the request body.
      const dataPrice = req.body;

      // Ensure that the 'valor' property exists and parse it correctly.
      // The keys here must match what the client sends in dataPrice.
      const MetrosBarda = dataPrice["Altura de instalacion"]?.valor;
      const CantiBardas = dataPrice["Numero de bardas"]?.valor;
      const MetrosLineales = dataPrice["Distancia lineal"]?.valor;
      const ContactoElec = dataPrice["Contacto cercano"]?.valor;
      const ControlRem = dataPrice["Control remoto"]?.valor;

      // Log extracted inputs for debugging.
      console.log("Extracted Inputs (from dataPrice):", {
        MetrosBarda,
        CantiBardas,
        MetrosLineales,
        ContactoElec,
        ControlRem,
      });

      // --- Check for "Otro" selections which require specialization ---
      const isSpecialized =
        MetrosBarda === "Otro" ||
        CantiBardas === "Otro" ||
        MetrosLineales === "Otro";

      if (isSpecialized) {
        return res.status(200).json({
          "Precio estimado": "Requiere más especialización",
          "Resumen de precios": {},
        });
      }

      let PrecioCercado = baseFencePrice; // Start with the base price from DB.
      let costoAlturaBarda = 0;
      let costoNumeroBardas = 0; // New cost component for 'Numero de bardas'
      let costoMetrosLineales = 0;
      let costoContactoElectrico = 0;
      let costoControlRemoto = 0;

      // --- 1. Calculate cost based on 'Altura de instalacion' (Height of Fence) ---
      // Validate if the value exists in our dynamically loaded prices.
      if (alturaBardaPrices[MetrosBarda] !== undefined) {
        costoAlturaBarda = alturaBardaPrices[MetrosBarda];
      } else {
        console.warn(
          `WARNING: Precio para Altura de instalacion "${MetrosBarda}" no encontrado en DB. Asumiendo costo 0.`
        );
      }
      PrecioCercado += costoAlturaBarda;
      console.log(
        `DEBUG: PrecioCercado after Altura de instalacion (${MetrosBarda}): ${PrecioCercado} (costoAlturaBarda: ${costoAlturaBarda})`
      );

      // --- 2. Calculate cost based on 'Numero de bardas' (Number of Walls) ---
      // This now impacts the price based on DB data.
      if (numeroBardasPrices[CantiBardas] !== undefined) {
        costoNumeroBardas = numeroBardasPrices[CantiBardas];
      } else {
        console.warn(
          `WARNING: Precio para Numero de bardas "${CantiBardas}" no encontrado en DB. Asumiendo costo 0.`
        );
      }
      PrecioCercado += costoNumeroBardas;
      console.log(
        `DEBUG: PrecioCercado after Numero de bardas (${CantiBardas}): ${PrecioCercado} (costoNumeroBardas: ${costoNumeroBardas})`
      );

      // --- 3. Calculate cost based on 'Distancia lineal' (Linear Meters) ---
      // Validate if the value exists in our dynamically loaded prices.
      if (metrosLinealesPrices[MetrosLineales] !== undefined) {
        costoMetrosLineales = metrosLinealesPrices[MetrosLineales];
      } else {
        console.warn(
          `WARNING: Precio para Distancia lineal "${MetrosLineales}" no encontrado en DB. Asumiendo costo 0. (Verifica si el valor de entrada es el esperado, ej., "0-10" en lugar de "Interior").`
        );
      }
      PrecioCercado += costoMetrosLineales;
      console.log(
        `DEBUG: PrecioCercado after Distancia lineal (${MetrosLineales}): ${PrecioCercado} (costoMetrosLineales: ${costoMetrosLineales})`
      );

      // --- 4. Calculate cost based on 'Contacto cercano' (Nearby Electrical Contact) ---
      // Apply cost only if 'No' as per original JS logic, taking the 'No' price from DB.
      if (ContactoElec === "No") {
        if (contactoCercanoPrices["No"] !== undefined) {
          costoContactoElectrico = contactoCercanoPrices["No"];
        } else {
          console.warn(
            `WARNING: Precio para Contacto cercano "No" no encontrado en DB. Asumiendo costo 0.`
          );
        }
      }
      PrecioCercado += costoContactoElectrico;
      console.log(
        `DEBUG: PrecioCercado after Contacto cercano (${ContactoElec}): ${PrecioCercado} (costoContactoElectrico: ${costoContactoElectrico})`
      );

      // --- 5. Calculate cost based on 'Control remoto' (Remote Control) ---
      // Apply cost only if 'Si' as per original JS logic, taking the 'Si' price from DB.
      if (ControlRem === "Si") {
        if (controlRemotoPrices["Si"] !== undefined) {
          costoControlRemoto = controlRemotoPrices["Si"];
        } else {
          console.warn(
            `WARNING: Precio para Control remoto "Si" no encontrado en DB. Asumiendo costo 0.`
          );
        }
      }
      PrecioCercado += costoControlRemoto;
      console.log(
        `DEBUG: PrecioCercado after Control remoto (${ControlRem}): ${PrecioCercado} (costoControlRemoto: ${costoControlRemoto})`
      );

      // Final Return
      return res.status(200).json({
        "Precio estimado": PrecioCercado.toFixed(2),
        "Resumen de precios": {
          "Costo Base Inicial": baseFencePrice.toFixed(2),
          "Costo por Altura de Barda": costoAlturaBarda.toFixed(2),
          "Costo por Numero de Bardas": costoNumeroBardas.toFixed(2), // Added to summary
          "Costo por Metros Lineales Adicionales":
            costoMetrosLineales.toFixed(2),
          "Costo por Falta de Contacto Eléctrico":
            costoContactoElectrico.toFixed(2),
          "Costo por Control Remoto": costoControlRemoto.toFixed(2),
        },
      });
    } catch (error) {
      console.error("Error calculating electric fence price:", error);
      return res.status(500).json({
        error: "Error al calcular el precio estimado del cercado eléctrico.",
        details: error.message,
      });
    }
  }
}

export default new indexController();
