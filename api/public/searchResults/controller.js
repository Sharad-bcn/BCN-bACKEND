const { _r } = require('express-tools')
const { Listing, Business, City } = require('../../../models')

/**
 * @argument {String} city
 * @argument {String} filter
 * @argument {String} category
 * @argument {String} subCategory
 * @argument {Number} limit
 * @argument {Number} pageNo
 */
module.exports.fetchBaseFields = async (req, res) => {
  try {
    const { args } = req.bind
    const maxDistance = 30000 //in meters

    let businessFilter = {
      isPublic: true,
      isApproved: true
    }

    let matchingCities = []

    if (args.city !== 'All Over India') {
      let city = await City.findOne({ city: args.city })
      matchingCities = await City.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [city.location.coordinates[0], city.location.coordinates[1]] // Note the order: [longitude, latitude]
            },
            $maxDistance: maxDistance
          }
        }
      })
      businessFilter.city = { $in: matchingCities.map(x => x.city) }
    }

    const businesses = await Business.find(businessFilter)

    const businessIds = businesses.map(business => business._id)

    // Create a map of business data for efficient lookup by fkBusinessId
    const businessMap = new Map()

    businesses.forEach(business => {
      businessMap.set(business._id.toString(), business)
    })

    let sort = {}

    if (args.filter === 'Date, new to old') sort.createdAt = -1

    if (args.filter === 'Date, old to new') sort.createdAt = 1

    if (args.filter === 'Alphabetically A-Z') sort.listingName = 1

    if (args.filter === 'Alphabetically Z-A') sort.listingName = -1

    const getAllListingCount = await Listing.count({
      fkBusinessId: { $in: businessIds },
      isActive: true,
      isPublic: true,
      isApproved: true,
      $or: [
        { category: null, subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
      ]
    })

    let listingsWithAddress = []

    if (args.pageNo > 1 ? args.limit * args.pageNo < getAllListingCount : 1) {
      const getAllListing = await Listing.find({
        fkBusinessId: { $in: businessIds },
        isActive: true,
        isPublic: true,
        isApproved: true,
        $or: [
          { category: null, subCategories: [] },
          { category: new RegExp(args.category, 'i'), subCategories: [] },
          { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
        ]
      })
        .sort(sort)
        .limit(args.limit || 10)
        .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

      // if (!getAllListing.length) return _r.error({ req, res, code: 400, message: 'Offerings not found' })

      // Add the 'address' field to each listing by looking it up in the business map
      listingsWithAddress = getAllListing.map(listing => {
        const business = businessMap.get(listing.fkBusinessId.toString())
        return {
          ...listing._doc,
          address: business ? business.address : null
        }
      })
    }

    const getAllBusinessWithNoListingsCount = await Business.count({
      ...businessFilter,
      $or: [
        { category: null, subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: [] },
        { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
      ],
      _id: { $nin: await Listing.distinct('fkBusinessId') }
    })

    let getBusinessWithNoListings = []

    if (args.pageNo > 1 ? args.limit * args.pageNo < getAllBusinessWithNoListingsCount : 1) {
      getBusinessWithNoListings = await Business.find(
        {
          ...businessFilter,
          $or: [
            { category: null, subCategories: [] },
            { category: new RegExp(args.category, 'i'), subCategories: [] },
            { category: new RegExp(args.category, 'i'), subCategories: new RegExp(args.subCategory, 'i') }
          ],
          _id: { $nin: await Listing.distinct('fkBusinessId') }
        },
        'businessName description phoneNo website fkUserId address createdAt dateOfEstablishment images location',
        { lean: true }
      )
        .sort(sort)
        .limit(args.limit || 10)
        .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

      // if (!getAllBusiness.length) return _r.error({ req, res, code: 400, message: 'Businesses not found' })
    }

    if (!listingsWithAddress.length && !getBusinessWithNoListings.length)
      return _r.error({ req, res, code: 400, message: 'No Businesses & Offerings found' })

    let combinedData = []
    const minLength = Math.min(listingsWithAddress.length, getBusinessWithNoListings.length)

    for (let i = 0; i < minLength; i++) {
      combinedData.push(listingsWithAddress[i])
      combinedData.push(getBusinessWithNoListings[i])
    }

    combinedData.push(...listingsWithAddress.slice(minLength), ...getBusinessWithNoListings.slice(minLength))

    _r.success({
      req,
      res,
      code: 200,
      payload: { total: Math.max(getAllListingCount, getAllBusinessWithNoListingsCount), results: combinedData }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}

/**
 * @argument {String} searchQuery
 * @argument {String} city
 * @argument {String} filter
 * @argument {Number} limit
 * @argument {Number} pageNo
 */
module.exports.searchFields = async (req, res) => {
  try {
    const { args } = req.bind
    const maxDistance = 30000 //in meters
    const searchQuery = new RegExp(args.searchQuery, 'i')

    let businessFilter = {
      isPublic: true,
      isApproved: true,
      $or: [
        { tags: searchQuery },
        { category: searchQuery },
        { subCategories: searchQuery },
        { businessName: searchQuery }
      ]
    }

    let matchingCities = []

    if (args.city !== 'All Over India') {
      let city = await City.findOne({ city: args.city })
      matchingCities = await City.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [city.location.coordinates[0], city.location.coordinates[1]] // Note the order: [longitude, latitude]
            },
            $maxDistance: maxDistance
          }
        }
      })
      businessFilter.city = { $in: matchingCities.map(x => x.city) }
    }

    const businesses = await Business.find(businessFilter)

    const businessIds = businesses.map(business => business._id)

    let sort = {}

    if (args.filter === 'Date, new to old') sort.createdAt = -1

    if (args.filter === 'Date, old to new') sort.createdAt = 1

    if (args.filter === 'Alphabetically A-Z') sort.listingName = 1

    if (args.filter === 'Alphabetically Z-A') sort.listingName = -1

    const getAllSearchedListingsCount = await Listing.count({
      // fkBusinessId: { $in: businessIds },
      // listingName: searchQuery,
      isActive: true,
      isPublic: true,
      isApproved: true,
      $or: [
        {
          fkBusinessId: { $in: businessIds },
          listingName: searchQuery
        },
        {
          fkBusinessId: { $in: businessIds }
        },
        { listingName: searchQuery }
        // { category: searchQuery },
        // { subCategory: searchQuery },
        // { businessName: searchQuery }
      ]
    })

    let searchedListingsWithAddress = []

    if (args.pageNo > 1 ? args.limit * args.pageNo < getAllSearchedListingsCount : 1) {
      const getAllSearchedListings = await Listing.find({
        // fkBusinessId: { $in: businessIds },
        // listingName: searchQuery,
        isActive: true,
        isPublic: true,
        isApproved: true,
        $or: [
          {
            fkBusinessId: { $in: businessIds },
            listingName: searchQuery
          },
          {
            fkBusinessId: { $in: businessIds }
          },
          { listingName: searchQuery }
          // { category: searchQuery },
          // { subCategory: searchQuery },
          // { businessName: searchQuery }
        ]
      })
        .sort(sort)
        .limit(args.limit || 10)
        .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)

      // if (!getAllSearchedListings.length) return _r.error({ req, res, code: 400, message: 'Offerings not found' })

      searchedListingsWithAddress = await Promise.all(
        getAllSearchedListings.map(async listing => {
          const business = await Business.findById(listing.fkBusinessId)
          return {
            ...listing._doc,
            address: business ? business.address : null
          }
        })
      )
    }

    const getAllSearchedBusinessWithNoListingsCount = await Business.count({
      ...businessFilter,
      _id: { $nin: await Listing.distinct('fkBusinessId') }
    })

    let getAllSearchedBusinessWithNoListings = []

    if (args.pageNo > 1 ? args.limit * args.pageNo < getAllSearchedBusinessWithNoListingsCount : 1) {
      getAllSearchedBusinessWithNoListings = await Business.find(
        {
          ...businessFilter,
          _id: { $nin: await Listing.distinct('fkBusinessId') }
        },
        'businessName description phoneNo website fkUserId address createdAt dateOfEstablishment images location',
        { lean: true }
      )
        .sort(sort)
        .limit(args.limit || 10)
        .skip(args.pageNo > 1 ? (args.limit || 10) * (args.pageNo - 1) : 0)
    }

    if (!searchedListingsWithAddress.length && !getAllSearchedBusinessWithNoListings.length)
      return _r.error({ req, res, code: 400, message: 'No Businesses & Offerings found' })

    let combinedData = []
    const minLength = Math.min(searchedListingsWithAddress.length, getAllSearchedBusinessWithNoListings.length)

    for (let i = 0; i < minLength; i++) {
      combinedData.push(searchedListingsWithAddress[i])
      combinedData.push(getAllSearchedBusinessWithNoListings[i])
    }

    combinedData.push(
      ...searchedListingsWithAddress.slice(minLength),
      ...getAllSearchedBusinessWithNoListings.slice(minLength)
    )

    _r.success({
      req,
      res,
      code: 200,
      payload: {
        total: Math.max(getAllSearchedListingsCount, getAllSearchedBusinessWithNoListingsCount),
        results: combinedData
      }
    })
  } catch (error) {
    _r.error({ req, res, error })
  }
}
