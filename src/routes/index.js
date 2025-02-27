// custom
const validationRoute = require("./validation.route");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const leaderboardRoute = require("./leaderboard.route");
const islands = require("./island.route");
const boards = require('./boards.route');
const messages = require('./messages.route');

const combineRoutes = (app) => {
  app.use("/api/validation", validationRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
  app.use("/api/leaderboard", leaderboardRoute);
  app.use("/api/islands", islands);
  app.use("/api/boards", boards);
  app.use("/api/messages", messages);
};

module.exports = combineRoutes;
