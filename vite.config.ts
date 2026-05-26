import { defineConfig } from 'vite';

export default defineConfig({
  assetsInclude: ['**/*.shard', '**/*.json'], // Esto le dice a Vite: "No compiles esto, solo sírvelo"
});