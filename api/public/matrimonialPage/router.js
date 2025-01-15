const { _validate } = require('express-tools');
const validator = require('./validator');
const controller = require('./controller');

module.exports = (app) => {
  app.post('/matrimonial/save', validator.save, controller.saveMatrimonial);
  app.post('/upload-pdf', validator.uploadPDF, controller.uploadPDF);
  app.get('/matrimonial/search', validator.search, controller.searchMatrimonial);
};
