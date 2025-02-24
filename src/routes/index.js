// custom
const validationRoute = require("./validation.route");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const leaderboardRoute = require("./leaderboard.route");
const islandRouter = require("./island.route");

const combineRoutes = (app) => {
  app.use("/api/validation", validationRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
  app.use("/api/leaderboard", leaderboardRoute);
  app.use("/api/islands", islandRouter);
};

module.exports = combineRoutes;
