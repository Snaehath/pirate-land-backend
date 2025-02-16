const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const morganConfig = require("./morgan.util");

const combineMiddlewares = (app) => {
  app.use(cors());
  app.use(morgan(morganConfig));
  app.use(express.json());
};

module.exports = combineMiddlewares;
