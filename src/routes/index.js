// custom
const validationRoute = require("./validation.route");
const authRoute = require("./auth.route");
const userRoute = require("./users.route");

const combineRoutes = (app) => {
  app.use("/api/validation", validationRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
};

module.exports = combineRoutes;
