export default {
  ignores: [
    ".codex-artifact-work/**",
    "outputs/**",
    "docs/.vitepress/dist/**",
    "playwright-report/**",
    "test-results/**",
  ],
  config: {
    default: true,
    MD013: false,
    MD024: false,
    MD025: false,
    MD026: false,
    MD029: false,
    MD033: false,
    MD036: false,
    MD040: false,
    MD041: false,
    MD051: false,
    MD053: false,
    MD060: false,
  },
};
