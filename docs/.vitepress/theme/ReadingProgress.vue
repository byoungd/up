<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vitepress";

const route = useRoute();
const progress = ref(0);
const active = ref(false);
let animationFrame: number | undefined;
let contentObserver: ResizeObserver | undefined;

function measureProgress() {
  animationFrame = undefined;
  const content = document.querySelector<HTMLElement>(".VPDoc .content-container");
  if (!content) {
    active.value = false;
    progress.value = 0;
    return;
  }

  const rootStyles = getComputedStyle(document.documentElement);
  const navHeight = Number.parseFloat(rootStyles.getPropertyValue("--vp-nav-height")) || 64;
  const contentTop = window.scrollY + content.getBoundingClientRect().top;
  const start = Math.max(0, contentTop - navHeight);
  const end = contentTop + content.scrollHeight - window.innerHeight;
  const distance = end - start;

  active.value = distance > 160;
  progress.value = distance > 0 ? Math.min(1, Math.max(0, (window.scrollY - start) / distance)) : 1;
}

function scheduleMeasurement() {
  if (animationFrame === undefined) animationFrame = window.requestAnimationFrame(measureProgress);
}

function observeContent() {
  contentObserver?.disconnect();
  const content = document.querySelector<HTMLElement>(".VPDoc .content-container");
  if (content) contentObserver?.observe(content);
  scheduleMeasurement();
}

onMounted(() => {
  contentObserver = new ResizeObserver(scheduleMeasurement);
  window.addEventListener("scroll", scheduleMeasurement, { passive: true });
  window.addEventListener("resize", scheduleMeasurement);
  observeContent();
});

watch(
  () => route.path,
  async () => {
    progress.value = 0;
    await nextTick();
    observeContent();
  },
);

onBeforeUnmount(() => {
  window.removeEventListener("scroll", scheduleMeasurement);
  window.removeEventListener("resize", scheduleMeasurement);
  contentObserver?.disconnect();
  if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
});
</script>

<template>
  <div
    v-show="active"
    class="reading-progress"
    aria-hidden="true"
    data-reading-progress
    :data-progress="(progress * 100).toFixed(1)"
  >
    <span class="reading-progress-value" :style="{ transform: `scaleX(${progress})` }" />
  </div>
</template>
