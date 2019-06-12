module.exports = function(config) {
  config.set({
    mutator: "typescript",
    packageManager: "npm",
    reporters: ["html", "clear-text", "progress"],
    testRunner: "jest",
    transpilers: [],
    coverageAnalysis: "off",
    tsconfigFile: "tsconfig.json",
    mutate: ["*.ts"],
    thresholds: {high: 95, low: 91, break: 90},
  });
};
