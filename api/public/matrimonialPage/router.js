const { $express } = require("express-tools");
const fileUpload = require("express-fileupload");

const $router = $express.Router();
const controller = require("./controller");

module.exports = $router;

// Middleware for logging requests
$router.use((req, res, next) => {
  console.log("=== New Request ===");
  console.log("Time:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  console.log("=================");
  next();
});

// File upload configuration
$router.use(
  fileUpload({
    debug: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    useTempFiles: true,
    tempFileDir: "/tmp/",
    abortOnLimit: true,
    createParentPath: true,
  })
);


// Matrimonial form submission route
$router.post("/save", controller.submitMatrimonialForm);

// Search profiles route
$router.get("/search", controller.searchMatrimonialProfiles);

// Test route
$router.get("/test", (req, res) => {
  res.json({ message: "API is working" });
});
