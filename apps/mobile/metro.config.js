const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Merge with Expo's default config instead of replacing it, so nothing Expo relies on gets dropped.
config.watchFolders = Array.from(new Set([...config.watchFolders, workspaceRoot]));
config.resolver.nodeModulesPaths = Array.from(
  new Set([...config.resolver.nodeModulesPaths, path.resolve(projectRoot, "node_modules"), path.resolve(workspaceRoot, "node_modules")])
);

module.exports = config;
