const { $express } = require('express-tools')

const $router = $express.Router()
module.exports = $router

const controller = require('./controller')

$router.get('/fetchCommonInfo', controller.fetchCommonInfo)
$router.get('/fetchBanners', controller.fetchBanners)
$router.get('/fetchTermsAndConditions', controller.fetchTermsAndConditions)
$router.get('/fetchPrivacyPolicy', controller.fetchPrivacyPolicy)
$router.get('/fetchSuccessStories', controller.fetchSuccessStories)
$router.get('/fetchFaqs', controller.fetchFaqs)
$router.get('/fetchContactInfo', controller.fetchContactInfo)
$router.get('/fetchAboutUs', controller.fetchAboutUs)
$router.get('/fetchSocialLinks', controller.fetchSocialLinks)
