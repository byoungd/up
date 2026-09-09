<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute } from "vitepress";

const route = useRoute();
let observer: MutationObserver | undefined;
let sidebarObserver: MutationObserver | undefined;
let observedSidebar: HTMLElement | null = null;
let animationFrame: number | undefined;
let searchWasOpen = false;
let searchTrigger: HTMLElement | null = null;
let searchLocation = "";
let sidebarWasOpen = false;
let sidebarLocation = "";
let narrowViewport: MediaQueryList | undefined;
let mobileViewport: MediaQueryList | undefined;

function setText(selector: string, value: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (element && element.textContent?.trim() !== value) element.textContent = value;
}

function setLabels(selector: string, value: string) {
  for (const element of document.querySelectorAll<HTMLElement>(selector)) {
    if (element.getAttribute("aria-label") !== value) element.setAttribute("aria-label", value);
  }
}

function headingText(anchor: HTMLElement) {
  const heading = anchor.closest<HTMLElement>("h1, h2, h3, h4, h5, h6");
  if (!heading) return "";
  const copy = heading.cloneNode(true) as HTMLElement;
  copy.querySelector(".header-anchor")?.remove();
  return copy.textContent?.trim() || "";
}

function syncSidebarControls() {
  const sidebar = document.querySelector<HTMLElement>(".VPSidebar");
  if (sidebar !== observedSidebar) {
    sidebarObserver?.disconnect();
    observedSidebar = sidebar;
    if (sidebar) sidebarObserver?.observe(sidebar, { attributes: true, attributeFilter: ["class"], subtree: true });
  }

  sidebar?.querySelectorAll<HTMLElement>(".VPSidebarItem.collapsible").forEach((section, index) => {
    const item = section.querySelector<HTMLElement>(":scope > .item");
    const children = section.querySelector<HTMLElement>(":scope > .items");
    const caret = item?.querySelector<HTMLElement>(":scope > .caret");
    if (!item || !children || !caret) return;

    const control = item.getAttribute("role") === "button" ? item : caret;
    children.id ||= `reader-sidebar-group-${index}`;
    control.setAttribute("aria-controls", children.id);
    control.setAttribute("aria-expanded", String(!section.classList.contains("collapsed")));

    // A text-only section already makes the whole row a button. Its nested
    // caret is decorative and must not create a second keyboard stop.
    if (control === item) {
      caret.setAttribute("aria-hidden", "true");
      caret.removeAttribute("role");
      caret.removeAttribute("tabindex");
    }
  });
}

function onSidebarKeydown(event: KeyboardEvent) {
  if (event.key !== " " || !(event.target instanceof HTMLElement)) return;
  const control = event.target.closest<HTMLElement>(".VPSidebarItem.collapsible > .item[role='button'], .VPSidebarItem.collapsible > .item > .caret[role='button']");
  if (!control || control.getAttribute("aria-hidden") === "true") return;
  event.preventDefault();
  if (!event.repeat) control.click();
}

function setAttribute(element: Element | null, name: string, value: string) {
  if (element?.getAttribute(name) !== value) element?.setAttribute(name, value);
}

function setInert(selector: string, inert: boolean) {
  const element = document.querySelector<HTMLElement>(selector);
  if (element && element.inert !== inert) element.inert = inert;
}

function currentLocation() {
  return window.location.pathname + window.location.hash;
}

function syncOverlays(isEnglish: boolean) {
  const search = document.querySelector<HTMLElement>(".VPLocalSearchBox");
  const sidebar = document.querySelector<HTMLElement>(".VPSidebar");
  const navOpen = Boolean(mobileViewport?.matches && document.querySelector(".VPNavScreen"));
  const sidebarOpen = Boolean(narrowViewport?.matches && sidebar?.classList.contains("open"));

  const layout = document.querySelector(".Layout");
  // The theme owns its semantic header/aside nodes. The common div can safely
  // represent their modal state while all content behind the panel is inert.
  if (navOpen || sidebarOpen) {
    setAttribute(layout, "role", "dialog");
    setAttribute(layout, "aria-modal", "true");
    setAttribute(layout, "aria-label", navOpen
      ? (isEnglish ? "Mobile navigation" : "移动端导航")
      : (isEnglish ? "Sidebar navigation" : "侧栏导航"));
  } else {
    for (const name of ["role", "aria-modal", "aria-label"]) layout?.removeAttribute(name);
  }
  setInert(".Layout", Boolean(search));
  setInert(".VPSkipLink", navOpen || sidebarOpen);
  setInert(".VPFooter", navOpen || sidebarOpen);
  setInert(".VPContent", navOpen || sidebarOpen);
  setInert(".VPLocalNav", navOpen || sidebarOpen);
  setInert(".VPNav", sidebarOpen);
  setInert(".VPSidebar", navOpen || Boolean(narrowViewport?.matches && !sidebarOpen));

  const navScreen = document.querySelector(".VPNavScreen");
  setAttribute(navScreen, "role", "navigation");
  setAttribute(navScreen, "aria-label", isEnglish ? "Mobile navigation" : "移动端导航");

  if (sidebarOpen && !sidebarWasOpen && !search) {
    sidebarLocation = currentLocation();
    sidebar?.querySelector<HTMLElement>("#VPSidebarNav")?.focus();
  } else if (!sidebarOpen && sidebarWasOpen && narrowViewport?.matches && !search && sidebarLocation === currentLocation()) {
    document.querySelector<HTMLElement>(".VPLocalNav .menu")?.focus({ preventScroll: true });
  }
  sidebarWasOpen = sidebarOpen;

  const translations = document.querySelector<HTMLElement>(".VPNavScreenTranslations");
  const translationList = translations?.querySelector<HTMLElement>(".list");
  if (translations && translationList) {
    translationList.id ||= "reader-mobile-languages";
    const expanded = translations.classList.contains("open");
    translationList.inert = !expanded;
    setAttribute(translations.querySelector("button"), "aria-controls", translationList.id);
    setAttribute(translations.querySelector("button"), "aria-expanded", String(expanded));
  }

  if (search) {
    if (!searchWasOpen) searchLocation = currentLocation();
    setAttribute(search, "role", "dialog");
    setAttribute(search, "aria-modal", "true");
    setAttribute(search, "aria-label", isEnglish ? "Search" : "搜索");
    for (const name of ["aria-owns", "aria-expanded", "aria-haspopup", "aria-labelledby"]) search.removeAttribute(name);
    const label = search.querySelector("#localsearch-label");
    if (label && !label.querySelector(".visually-hidden")) {
      const text = document.createElement("span");
      text.className = "visually-hidden";
      text.textContent = isEnglish ? "Search" : "搜索";
      label.append(text);
    }
    const input = search.querySelector<HTMLInputElement>("#localsearch-input");
    setAttribute(input, "role", "combobox");
    setAttribute(input, "aria-autocomplete", "list");
    setAttribute(input, "aria-haspopup", "listbox");
    setAttribute(input, "aria-expanded", String(Boolean(search.querySelector("#localsearch-list"))));
    for (const result of search.querySelectorAll<HTMLAnchorElement>("a.result")) {
      const item = result.parentElement;
      if (!item) continue;
      // Each result is one listbox option. Nested links would create duplicate
      // controls; arrow keys keep focus in the input while Enter follows its href.
      setAttribute(result, "id", `localsearch-item-${result.dataset.index}`);
      setAttribute(result, "role", "option");
      setAttribute(result, "aria-selected", String(result.classList.contains("selected")));
      setAttribute(result, "tabindex", "-1");
      setAttribute(item, "role", "presentation");
      item.removeAttribute("id");
      item.removeAttribute("aria-selected");
    }
    for (const key of search.querySelectorAll("kbd[aria-label]")) setAttribute(key, "role", "img");
    let status = search.querySelector<HTMLElement>(".reader-search-status");
    if (!status) {
      status = document.createElement("div");
      status.className = "visually-hidden reader-search-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      status.setAttribute("aria-atomic", "true");
      search.querySelector(".shell")?.append(status);
    }
    const noResults = search.querySelector(".no-results")?.textContent?.trim() || "";
    if (status.textContent !== noResults) status.textContent = noResults;
  } else if (searchWasOpen && searchLocation === currentLocation()) {
    // VitePress focuses its input before activating its focus trap, so the trap
    // cannot reliably restore the original trigger when its input is removed.
    const trigger = searchTrigger?.isConnected ? searchTrigger : document.querySelector<HTMLElement>(".DocSearch-Button");
    trigger?.focus({ preventScroll: true });
  }
  searchWasOpen = Boolean(search);
}

function recordSearchTrigger(event: Event) {
  if (event.target instanceof Element && event.target.closest(".DocSearch-Button")) {
    searchTrigger = event.target.closest<HTMLElement>(".DocSearch-Button");
  }
}

function onOverlayKeydown(event: KeyboardEvent) {
  if (!searchWasOpen && ((event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) || event.key === "/")) {
    searchTrigger = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement
      : document.querySelector<HTMLElement>(".DocSearch-Button");
  }
  const search = document.querySelector(".VPLocalSearchBox");
  if (search) {
    // Upstream increments the selected index even for an empty result set,
    // which would make aria-activedescendant reference a nonexistent option.
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && !search.querySelector("a.result")) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    return;
  }
  const nav = mobileViewport?.matches && document.querySelector<HTMLElement>(".VPNavScreen")
    ? document.querySelector<HTMLElement>(".VPNav") : null;
  const sidebar = narrowViewport?.matches ? document.querySelector<HTMLElement>(".VPSidebar.open") : null;
  const overlay = nav || sidebar;
  if (!overlay) return;
  if (event.key === "Escape" && nav) {
    event.preventDefault();
    const trigger = nav.querySelector<HTMLElement>(".VPNavBarHamburger");
    trigger?.click();
    trigger?.focus();
    return;
  }
  if (event.key !== "Tab") return;
  const controls = [...overlay.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, [tabindex]")]
    .filter((element) => element.tabIndex >= 0 && !element.closest("[inert]") && !element.matches(":disabled")
      && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
  const first = controls[0];
  const last = controls.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement as HTMLElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
}

function localizeLabels() {
  animationFrame = undefined;
  const isEnglish = document.documentElement.lang.startsWith("en");

  setText("#main-nav-aria-label", isEnglish ? "Main Navigation" : "主导航");
  setText("#sidebar-aria-label", isEnglish ? "Sidebar Navigation" : "侧栏导航");
  setText("#doc-footer-aria-label", isEnglish ? "Pager" : "章节导航");
  setLabels(".VPNavBarHamburger", isEnglish ? "Mobile navigation" : "移动端导航");
  setLabels(".VPSidebarItem .caret", isEnglish ? "Toggle section" : "展开或收起分组");
  setLabels(".VPNavBarExtra .button", isEnglish ? "Extra navigation" : "更多导航");
  syncSidebarControls();
  syncOverlays(isEnglish);

  for (const anchor of document.querySelectorAll<HTMLElement>(".header-anchor")) {
    const text = headingText(anchor);
    if (!text) continue;
    const label = isEnglish ? `Permalink to "${text}"` : `“${text}”的固定链接`;
    if (anchor.getAttribute("aria-label") !== label) anchor.setAttribute("aria-label", label);
  }
}

function scheduleLocalization() {
  if (animationFrame === undefined) animationFrame = window.requestAnimationFrame(localizeLabels);
}

onMounted(() => {
  sidebarObserver = new MutationObserver((records) => {
    if (records.some(({ target }) => target instanceof HTMLElement && target.matches(".VPSidebar, .VPSidebarItem.collapsible"))) {
      scheduleLocalization();
    }
  });
  observer = new MutationObserver((records) => {
    if (records.some((record) => record.type === "childList" || (record.target instanceof Element
      && record.target.matches(".VPNavScreenTranslations, .VPLocalSearchBox .result, .VPLocalSearchBox li, .VPLocalSearchBox input")))) scheduleLocalization();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-controls", "aria-selected"] });
  narrowViewport = window.matchMedia("(max-width: 959px)");
  mobileViewport = window.matchMedia("(max-width: 767px)");
  narrowViewport.addEventListener("change", scheduleLocalization);
  mobileViewport.addEventListener("change", scheduleLocalization);
  document.addEventListener("click", recordSearchTrigger, true);
  document.addEventListener("keydown", onOverlayKeydown, true);
  document.addEventListener("keydown", onSidebarKeydown);
  scheduleLocalization();
});

watch(
  () => route.path,
  async () => {
    await nextTick();
    scheduleLocalization();
  },
);

onBeforeUnmount(() => {
  observer?.disconnect();
  sidebarObserver?.disconnect();
  document.removeEventListener("keydown", onSidebarKeydown);
  document.removeEventListener("keydown", onOverlayKeydown, true);
  document.removeEventListener("click", recordSearchTrigger, true);
  narrowViewport?.removeEventListener("change", scheduleLocalization);
  mobileViewport?.removeEventListener("change", scheduleLocalization);
  for (const selector of [".Layout", ".VPSkipLink", ".VPFooter", ".VPContent", ".VPLocalNav", ".VPNav", ".VPSidebar"]) setInert(selector, false);
  if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
});
</script>

<template></template>
