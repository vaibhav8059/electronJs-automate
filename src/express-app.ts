import express from "express";
import path from "path";
import logger from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import http from "http";
import createError from "http-errors";
import { expressPort } from "../package.json";
const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

const app = express();
const router = express.Router();

// const routes = [
//   { path: "/", viewName: "index", title: "Home" },
//   { path: "/pageTwo", viewName: "pageTwo", title: "Page 2" },
//   { path: "/pageThree", viewName: "pageThree", title: "Page 3" },
//   { path: "/pageFour", viewName: "pageFour", title: "Page 4" }
// ];


// routes.forEach(({ path, viewName, title }) => {
//   router.get(path, (_req, res) => res.render(viewName, { title }));
// });

async function loginTest() {
 
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("https://test-login-app.vercel.app/");
    await driver.findElement(By.id("email")).sendKeys("test3@gmail.com");
    await driver.findElement(By.id("password")).sendKeys("Password@12345");
    await driver.findElement(By.name("login")).click();

    const pageTitle = await driver.getTitle();
   
    assert.strictEqual(pageTitle, "Welcomepage");
    
    await driver.wait(until.titleIs("Welcomepage"), 4000);
  } finally {
    await driver.quit();
    return;
  }
}
router.get("/",(req, res) => {
  res.render("index", {title:"Home"})
  loginTest()
})

router.get("/pageTwo",(req, res) => {
  res.render("pageTwo", {title:"Page 2"})
})

router.get("/pageThree",(req, res) => {
  res.render("pageThree", {title:"Page 3"})
})

router.get("/pageFour",(req, res) => {
  res.render("pageFour", {title:"Page 4"})
})

app.set("port", expressPort);
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/", router);
app.use((_req, _res, next) => next(createError(404)));
app.use((err: any, req: any, res: any, _next: any) => {
  res.locals.title = "error";
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500).render("error");
});

const server = http.createServer(app);

function handleServerError(error: any) {
  if (error.syscall !== "listen") throw error;

  const bind = typeof expressPort === "string" ? `Pipe ${expressPort}` : `Port ${expressPort}`;
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function shutdown() {
  console.log("Shutting down Express server...");
  server.close();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(expressPort);
server.on("error", handleServerError);
server.on("listening", () => console.log(`Listening on: ${expressPort}`));
server.on("close", () => console.log("Express server closed."));