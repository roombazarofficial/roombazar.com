const path = require("node:path");
const tsconfigPaths = require("tsconfig-paths");

// TypeScript preserves imports such as `src/common/...` in the compiled JS.
// Point those imports at the flattened `dist` directory before loading Nest.
tsconfigPaths.register({
  baseUrl: path.join(__dirname, "dist"),
  paths: {
    "src/*": ["*"],
  },
});
