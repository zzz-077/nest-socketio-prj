import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // Moves third-party libraries to a separate chunk
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increases warning limit (optional)
    minify: "esbuild", // Ensures minification
  },
});
