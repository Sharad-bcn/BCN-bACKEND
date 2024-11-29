const { _validate, $joi } = require('express-tools')

module.exports.update = (req, res, next) =>
  _validate.joi(req, res, next, {
    banners: $joi.array().items($joi.string().allow(null, '')),
    links: $joi.array().items($joi.string().allow(null, '')),
    aboutUs: $joi.string().allow(null, ''),
    privacyPolicy: $joi.string().allow(null, ''),
    termsAndConditions: $joi.string().allow(null, ''),
    phoneNo: $joi.number().integer().min(1000000000).max(9999999999).allow(null, ''),
    email: $joi
      .string()
      .email({
        minDomainSegments: 2, // Ensures at least two domain segments (e.g., example.com)
        tlds: { allow: ['com', 'net', 'org', 'edu', 'in'] } // Specify valid top-level domains
      })
      .trim()
      .allow(null, ''),
    instagramLink: $joi.string().allow(null, ''),
    facebookLink: $joi.string().allow(null, ''),
    whatsappLink: $joi.string().allow(null, '')
  })
