// custom
const validationRoute = require("./validation.route");

const combineRoutes = (app) => {
  app.use("/api/validation", validationRoute);
};

module.exports = combineRoutes;
