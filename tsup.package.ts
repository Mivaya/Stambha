import { defineConfig, type Options } from "tsup";

/** tsup injects `baseUrl: "."` during DTS — TS 6 errors unless silenced (egoist/tsup#1388). */
const dtsCompilerOptions = { ignoreDeprecations: "6.0" as const };

function mergeDtsOption(dts: Options["dts"]): Options["dts"] {
  if (dts === false) return false;
  if (dts === true || dts === undefined) {
    return { compilerOptions: dtsCompilerOptions };
  }
  return {
    ...dts,
    compilerOptions: {
      ...dtsCompilerOptions,
      ...dts.compilerOptions,
    },
  };
}

/** Shared tsup defaults — dual ESM + CJS for Node `import` and `require`. */
export function stambhaPackageConfig(overrides: Options = {}) {
  const { dts: dtsOverride, ...rest } = overrides;
  return defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    sourcemap: true,
    clean: true,
    target: "node20",
    ...rest,
    dts: mergeDtsOption(dtsOverride ?? true),
  });
}
