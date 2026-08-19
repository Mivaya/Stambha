<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { computed, watch } from "vue";
import { useRoute } from "vitepress";
import ModeSwitcher from "./components/ModeSwitcher.vue";

const { Layout: DefaultLayout } = DefaultTheme;
const route = useRoute();

const isApiMode = computed(() => {
  const path = route.path.replace(/\/$/, "") || "/";
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
  <DefaultLayout>
    <template #nav-bar-title-after>
      <ModeSwitcher />
    </template>
  </DefaultLayout>
</template>
