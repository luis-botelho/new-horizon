import type { NextConfig } from 'next';
import path from 'node:path';

const config: NextConfig = {
  reactStrictMode: true,
  // Permite `@use 'tokens'` / `@use 'mixins'` nos módulos SCSS sem caminhos relativos.
  sassOptions: {
    loadPaths: [path.join(process.cwd(), 'src/styles')],
    includePaths: [path.join(process.cwd(), 'src/styles')], // compat com a API legada do sass-loader
  },
};

export default config;
