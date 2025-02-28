const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const morganConfig = require("./morgan.util");
const { verifyUser } = require("./jwt.util");
const corsConfig = require("../configs/cors.config");

const combineMiddlewares = (app) => {
  app.use(cors(corsConfig));
  app.use(verifyUser);
  app.use(morgan(morganConfig));
  app.use(express.json());
};

module.exports = combineMiddlewares;
