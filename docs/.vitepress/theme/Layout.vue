<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vitepress";
import ModeSwitcher from "./components/ModeSwitcher.vue";
import { isApiDocsPath } from "./docsMode";

const { Layout: DefaultLayout } = DefaultTheme;
const route = useRoute();
const browserPath = ref("");

function readBrowserPath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
}

onMounted(() => {
  browserPath.value = readBrowserPath();
  window.addEventListener("popstate", syncBrowserPath);
});

onUnmounted(() => {
  window.removeEventListener("popstate", syncBrowserPath);
});

function syncBrowserPath() {
  browserPath.value = readBrowserPath();
}

const isApiMode = computed(() => {
  const fromWindow = browserPath.value;
  if (fromWindow) return isApiDocsPath(fromWindow);
  return isApiDocsPath(route.path);
});

watch(
  () => route.path,
  () => {
    browserPath.value = readBrowserPath();
  },
);

watch(
  isApiMode,
  (api) => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.stambhaDocsMode = api ? "api" : "guide";
  },
  { immediate: true },
);
</script>

<template>
  <DefaultLayout>
    <template #nav-bar-title-after>
      <ModeSwitcher />
    </template>
  </DefaultLayout>
</template>
