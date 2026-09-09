import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { Fragment, h } from "vue";
import LocalizedA11yLabels from "./LocalizedA11yLabels.vue";
import ReadingProgress from "./ReadingProgress.vue";
import WorksheetActions from "./WorksheetActions.vue";
import "./styles.css";

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "layout-top": () => h(Fragment, null, [h(ReadingProgress), h(LocalizedA11yLabels)]),
      "doc-before": () => h(WorksheetActions),
    }),
} satisfies Theme;
