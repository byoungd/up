<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useData, withBase } from "vitepress";

const { frontmatter, lang } = useData();
const worksheet = computed(() => frontmatter.value.worksheetDownload as { url: string; name: string } | undefined);
const english = computed(() => lang.value.startsWith("en"));
const busy = ref(false);
const feedback = ref("");
let controller: AbortController | undefined;

function reset() {
  controller?.abort();
  controller = undefined;
  busy.value = false;
  feedback.value = "";
}
watch(worksheet, reset);
onBeforeUnmount(reset);

async function copyWorksheet() {
  const entry = worksheet.value;
  if (!entry || busy.value) return;
  busy.value = true;
  feedback.value = "";
  const request = new AbortController();
  controller = request;
  try {
    if (!navigator.clipboard) throw new Error("Clipboard unavailable");
    const text = fetch(withBase(entry.url), { signal: request.signal }).then((response) => {
      if (!response.ok) throw new Error("Worksheet unavailable");
      return response.text();
    });
    // Keep the write within the click gesture, including Safari's stricter
    // clipboard activation rules; the public document may finish loading later.
    if (navigator.clipboard.write && typeof ClipboardItem !== "undefined") {
      const blob = text.then((value) => new Blob([value], { type: "text/plain" }));
      blob.catch(() => {});
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
    } else {
      await navigator.clipboard.writeText(await text);
    }
    if (!request.signal.aborted) feedback.value = english.value ? "Copied. Paste into your private notes." : "已复制，可粘贴到自己的私有笔记。";
  } catch {
    if (!request.signal.aborted) feedback.value = english.value ? "Copy was unavailable. Use the Markdown download instead." : "暂时无法复制，请使用 Markdown 下载。";
  } finally {
    if (controller === request) {
      busy.value = false;
      controller = undefined;
    }
  }
}
</script>

<template>
  <section v-if="worksheet" class="worksheet-actions" :aria-label="english ? 'Use this worksheet' : '使用这张工作表'">
    <p>{{ english ? "Take the whole worksheet into your notes, including instructions, tables, and review steps." : "把整张工作表带到自己的笔记中，保留填写说明、表格和复查步骤。" }}</p>
    <div class="worksheet-actions-buttons">
      <a :href="withBase(worksheet.url)" :download="worksheet.name">{{ english ? "Download Markdown" : "下载 Markdown" }}</a>
      <button type="button" :disabled="busy" @click="copyWorksheet">{{ english ? (busy ? "Copying…" : "Copy worksheet") : (busy ? "复制中…" : "复制整张工作表") }}</button>
    </div>
    <p class="worksheet-feedback" role="status">{{ feedback }}</p>
  </section>
</template>

<style scoped>
.worksheet-actions {
  margin: 0 0 24px;
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.worksheet-actions p { margin: 0 0 12px; color: var(--vp-c-text-2); font-size: 14px; line-height: 1.65; }
.worksheet-actions-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
.worksheet-actions a, .worksheet-actions button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  cursor: pointer;
}
.worksheet-actions a:hover, .worksheet-actions button:hover { border-color: var(--vp-c-brand-1); }
.worksheet-actions a:focus-visible, .worksheet-actions button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.worksheet-actions button:disabled { cursor: progress; }
.worksheet-actions .worksheet-feedback { margin: 10px 0 0; }
.worksheet-feedback:empty { margin: 0; }
@media print { .worksheet-actions { display: none; } }
</style>
