import http from "http";
import { URLSearchParams } from "url";
import qs from "querystring";

function createApp() {
  const routes = [];
  const middlewares = [];

  const app = (req, res) => {
    let index = 0;

    // res.status()
    res.status = function (code) {
      res.statusCode = code;
      return res;
    };

    // res.json()
    res.json = (data, status = res.statusCode || 200) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };

    // res.send()
    res.send = (data, status = res.statusCode || 200) => {
      if (typeof data === "object" && data !== null)
        return res.json(data, status);
      res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
      res.end(String(data));
    };

    const notFound = () => {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 - Not Found");
    };

    const next = (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`500 - Server Error: ${err.message}`);
        return;
      }

      if (index < middlewares.length) {
        middlewares[index++](req, res, next);
      } else {
        const route = routes.find(
          (r) =>
            r.path === req.url &&
            (r.method === req.method || r.method === "ALL")
        );
        route ? route.handler(req, res, next) : notFound();
      }
    };

    next();
  };

  // =========================================================================
  // HTTP মেথড
  const addRoute = (method, path, handler) => {
    routes.push({ method: method.toUpperCase(), path, handler });
  };

  app.get = (path, handler) => addRoute("GET", path, handler);
  app.post = (path, handler) => addRoute("POST", path, handler);
  app.put = (path, handler) => addRoute("PUT", path, handler);
  app.patch = (path, handler) => addRoute("PATCH", path, handler);
  app.delete = (path, handler) => addRoute("DELETE", path, handler);
  app.all = (path, handler) => addRoute("ALL", path, handler);

  // =========================================================================
  // app.use() - মিডলওয়্যার

  app.use = (middleware) => {
    if (typeof middleware !== "function") {
      throw new Error("Middleware must be a function");
    }
    middlewares.push(middleware);
  };

  // =========================================================================
  // app.json() - JSON বডি পার্সার (express.json())
  app.json = () => {
    return (req, res, next) => {
      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes("application/json")) return next();

      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          req.body = body ? JSON.parse(body) : {};
        } catch (e) {
          req.body = {};
        }
        next();
      });
    };
  };

  // =========================================================================
  // app.urlencoded() - ফর্ম ডেটা পার্সার (express.urlencoded())

  app.urlencoded = (options = {}) => {
    const { extended = false } = options;

    return (req, res, next) => {
      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes("application/x-www-form-urlencoded"))
        return next();

      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          if (extended) {
            req.body = qs.parse(body);
          } else {
            const params = new URLSearchParams(body);
            req.body = Object.fromEntries(params);
          }
        } catch (e) {
          req.body = {};
        }
        next();
      });
    };
  };

  // =========================================================================
  // app.listen() - সার্ভার চালু করা
  app.listen = (port, callback) => {
    const server = http.createServer(app);
    server.listen(port, () => {
      if (callback) callback();
    });
    return server;
  };

  return app;
}

export default createApp;
