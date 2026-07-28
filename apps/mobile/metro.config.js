const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Expo's own default config already auto-detects the monorepo's workspace
// packages (root node_modules, apps/*, packages/*) and watches them — merge
// with that instead of replacing it, so nothing Expo relies on gets dropped.
config.watchFolders = Array.from(new Set([...config.watchFolders, workspaceRoot]));
config.resolver.nodeModulesPaths = Array.from(
  new Set([...config.resolver.nodeModulesPaths, path.resolve(projectRoot, "node_modules"), path.resolve(workspaceRoot, "node_modules")])
);

module.exports = config;
