import { readdir, lstatSync } from "fs";
import express from "express";
import { watch } from "chokidar";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

const dirToWatch = [];

const requestedFilePaths = process.argv.slice(2);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const getFiles = (path, callback) => {
  readdir(path, function (err, children) {
    if (err) {
      console.log("Unable to scan directory: " + path + err);
      return err;
    }

    const res = children.map((child) => {
      return {
        name: child,
        parent: path,
        path: `${path}/${child}`,
        isDirectory: lstatSync(`${path}/${child}`).isDirectory(),
      };
    });
    callback({ [path]: res });
  });
};

io.on("connection", (socket) => {
  socket.emit("connection", null);

  if (requestedFilePaths.length) {
    // For the watcher
    requestedFilePaths.forEach((path) => {
      dirToWatch.push(path);
    });

    const watcher = watch(dirToWatch, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    // Emit on all type of  changes
    watcher.on("all", (eventType, name) => {
      const parsedPath = path.parse(name);
      socket.emit("Change", {
        type: eventType,
        parent: parsedPath.dir,
        name: parsedPath.name,
        path: name,
        isDirectory:
          eventType == "addDir" ? lstatSync(name).isDirectory() : false,
      });
    });
  } else {
    console.log("Please pass in the directory path as cli args");
    socket.emit("error", "Wrong input");
  }

  // Initial data load
  socket.on("Get Base", () => {
    requestedFilePaths.forEach((path) => {
      getFiles(path, (files) => socket.emit("Base", files));
    });
  });

  // Load children for a nested dir
  socket.on("Get Children", (path) => {
    getFiles(path, (files) => socket.emit("Update Children", files));
  });
});

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "client", "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

httpServer.listen(8080, () => {
  console.log("listening on *:8080");
});
