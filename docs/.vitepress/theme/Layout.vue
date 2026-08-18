<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { computed, watch } from "vue";
import { useRoute } from "vitepress";
import MobileModeDrawer from "./components/MobileModeDrawer.vue";
import ModeSwitcher from "./components/ModeSwitcher.vue";

const { Layout: DefaultLayout } = DefaultTheme;
const route = useRoute();

const isApiMode = computed(() => {
  const path = route.path;
  return path === "/api" || path.startsWith("/api/");
});

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
  <div class="stambha-docs-root" :class="isApiMode ? 'mode-api' : 'mode-guide'">
    <DefaultLayout>
      <template #nav-bar-content-before>
        <ModeSwitcher class="stambha-mode-switcher--desktop" />
      </template>
    </DefaultLayout>
    <MobileModeDrawer />
  </div>
</template>
