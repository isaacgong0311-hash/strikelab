const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const isDev = process.env.NODE_ENV === "development";
const PORT = isDev ? 3000 : 3941; // avoid clashing with dev server in prod

let mainWindow;
let serverProcess;

// ── Production: start the Next.js standalone server ─────────────────────────
function startServer() {
  const serverScript = path.join(
    process.resourcesPath,
    "app",
    ".next",
    "standalone",
    "server.js"
  );

  serverProcess = spawn(process.execPath, [serverScript], {
    env: {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
    },
    stdio: "pipe",
  });

  serverProcess.stderr.on("data", (d) => console.error("[next]", d.toString()));
  serverProcess.stdout.on("data", (d) => console.log("[next]", d.toString()));
}

// ── Wait for the server to accept connections ────────────────────────────────
async function waitForServer(url, retries = 60) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Next.js server did not start within 30 s");
}

// ── Create the app window ────────────────────────────────────────────────────
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "StrikeLab",
    autoHideMenuBar: true,
    backgroundColor: "#07101f",
    show: false,
  });

  const appUrl = `http://localhost:${PORT}`;

  if (!isDev) {
    startServer();
    try {
      await waitForServer(appUrl);
    } catch (e) {
      console.error(e.message);
      app.quit();
      return;
    }
  }

  mainWindow.loadURL(appUrl);

  // Show as soon as ready-to-show fires; fall back after 3 s in case it doesn't
  mainWindow.once("ready-to-show", () => mainWindow.show());
  setTimeout(() => { if (mainWindow && !mainWindow.isVisible()) mainWindow.show(); }, 3000);

  // Open external URLs in the system browser, not inside the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
