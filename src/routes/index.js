// custom
const validationRoute = require("./validation.route");
const authRoute = require("./auth.route");

const combineRoutes = (app) => {
  app.use("/api/validation", validationRoute);
  app.use("/api/auth", authRoute);
};

module.exports = combineRoutes;
