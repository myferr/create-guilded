const fs = require("fs");
const fsPromises = require("fs-extra").promises;

module.exports = {
  fsNoPromises: fs,
  fsPromises: fsPromises,
};
