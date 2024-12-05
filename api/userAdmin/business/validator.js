const { _validate, $joi } = require('express-tools')

module.exports.create = (req, res, next) =>
  _validate.joi(req, res, next, {
    tags: $joi.array().items($joi.string().allow(null, '')),
    images: $joi.array().items($joi.string().allow(null, '')),
    businessName: $joi.string().min(3).max(60),
    description: $joi.string().min(2),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    gst: $joi.string().allow(null, ''),
    website: $joi.string().min(3).allow(null, ''),
    category: $joi.string(),
    subCategories: $joi.array().items($joi.string().allow(null, '')),
    address: $joi.string().min(3),
    state: $joi.string(),
    city: $joi.string(),
    pinCode: $joi.number().integer().min(100000).max(999999),
    facebookLink: $joi.string().allow(null, ''),
    instagramLink: $joi.string().allow(null, ''),
    dateOfEstablishment: $joi.string().allow(null, ''),
    workingHours: $joi.object({
      timings: $joi.array().items(
        $joi.object({
          day: $joi
            .string()
            .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
            .required(),
          from: $joi.string().allow(null, ''),
          to: $joi.string().allow(null, ''),
          isClosed: $joi.boolean()
        })
      ),
      isOpen24Hours: $joi.boolean()
    }),
    location: $joi.object({
      type: $joi.string().valid('Point').default('Point'),
      coordinates: $joi.array().items($joi.number()).default([0, 0])
    })
  })

module.exports.update = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string(),
    tags: $joi.array().items($joi.string().allow(null, '')),
    images: $joi.array().items($joi.string().allow(null, '')),
    businessName: $joi.string().min(3).max(60),
    description: $joi.string().min(2),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999),
    gst: $joi.string().allow(null, ''),
    website: $joi.string().min(3).allow(null, ''),
    category: $joi.string(),
    subCategories: $joi.array().items($joi.string().allow(null, '')),
    address: $joi.string().min(3),
    state: $joi.string(),
    city: $joi.string(),
    pinCode: $joi.number().integer().min(100000).max(999999),
    facebookLink: $joi.string().allow(null, ''),
    instagramLink: $joi.string().allow(null, ''),
    dateOfEstablishment: $joi.string().allow(null, ''),
    workingHours: $joi.object({
      timings: $joi.array().items(
        $joi.object({
          day: $joi
            .string()
            .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
            .required(),
          from: $joi.string().allow(null, ''),
          to: $joi.string().allow(null, ''),
          isClosed: $joi.boolean()
        })
      ),
      isOpen24Hours: $joi.boolean()
    }),
    location: $joi.object({
      type: $joi.string().valid('Point').default('Point'),
      coordinates: $joi.array().items($joi.number()).default([0, 0])
    })
  })

module.exports.fetch = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })

module.exports.fetchAll = (req, res, next) =>
  _validate.joi(req, res, next, {
    perPage: $joi.number(),
    pageNo: $joi.number().min(1),
    filter: $joi.string().allow(null, '')
  })

module.exports.delete = (req, res, next) =>
  _validate.joi(req, res, next, {
    id: $joi.string()
  })
