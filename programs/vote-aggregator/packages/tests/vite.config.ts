import {defineConfig, mergeConfig} from 'vite';
import {tanstackBuildConfig} from '@tanstack/config/build';

const config = defineConfig({
});

export default mergeConfig(
  config,
  tanstackBuildConfig({
    entry: './src/index.ts',
    srcDir: './src',
  })
);
