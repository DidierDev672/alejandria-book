import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { exec } from "node:child_process";

/**
 * Auto-arranque de Ollama para el chat de rutinas AI.
 * POST /ollama-boot → ejecuta "ollama run llama3" en la máquina local
 * (descarga el modelo si falta, levanta el server y lo deja cargado).
 */
function ollamaAutoStart(): Plugin {
  let booting = false;
  return {
    name: "ollama-auto-start",
    configureServer(server) {
      server.middlewares.use("/ollama-boot", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }

        if (!booting) {
          booting = true;
          console.log("[ollama-auto-start] Ejecutando: ollama run llama3");
          exec(
            'ollama run llama3 "OK"',
            { windowsHide: true, timeout: 15 * 60 * 1000 },
            (error) => {
              booting = false;
              if (error) {
                console.error("[ollama-auto-start] Falló ollama run llama3:", error.message);
              } else {
                console.log("[ollama-auto-start] Modelo llama3 listo");
              }
            },
          );
        }

        res.statusCode = 202;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ status: "starting", command: "ollama run llama3" }));
      });
    },
  };
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), ollamaAutoStart()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Proxy para redirigir peticiones al backend
      "/equipment/exercises": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/equipment": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/exercises": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/progress-member": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/members": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/digital-books": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/books": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      // Proxy para workouts del Coliseo (asignación de rutinas a miembros)
      "/colesio": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      // Proxy para el servicio de rutinas (Go backend en puerto 8080)
      "/api/routines": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      // Proxy para el servicio de respaldos (Go backend en puerto 8083)
      "/api/status": {
        target: "http://localhost:8083",
        changeOrigin: true,
        secure: false,
      },
      "/api/backups": {
        target: "http://localhost:8083",
        changeOrigin: true,
        secure: false,
      },
      "/api/backups/download": {
        target: "http://localhost:8083",
        changeOrigin: true,
        secure: false,
      },
      // Proxy para Ollama (chat de rutinas asistidas por AI)
      "/ollama": {
        target: "http://localhost:11434",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ollama/, ""),
      },
    },
  },
});
