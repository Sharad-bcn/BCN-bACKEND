;(async () => {
  try {
    const { server, _r, _env } = require('express-tools')
    const fs = require('fs')
    const app = server(_env('PORT'))
    const { db } = require('./helpers')

    await db()

    app.get(['/', '/status'], (req, res) => _r.success({ req, res }))
    app.get('/version', (req, res) => {
      try {
        const version = fs.readFileSync('./version.txt').toString().trim()
        _r.success({ req, res, payload: { version } })
      } catch (error) {
        _r.error({ req, res, error })
      }
    })

    app.use('/api', require('./api'))
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
})()
