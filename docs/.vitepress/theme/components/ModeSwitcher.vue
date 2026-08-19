<script setup lang="ts">
import { computed } from "vue";
import { useRoute, withBase } from "vitepress";

const STORAGE_KEY = "stambha-docs-mode";
const route = useRoute();

const mode = computed<"guide" | "api">(() => {
  const path = route.path.replace(/\/$/, "") || "/";
  return path === "/api" || path.startsWith("/api/") ? "api" : "guide";
});

const guideHref = computed(() => withBase("/guide/getting-started"));
const apiHref = computed(() => withBase("/api/"));

function remember(target: "guide" | "api") {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, target);
  }
}

function onGuideClick(event: MouseEvent) {
  remember("guide");
  if (mode.value === "guide") event.preventDefault();
}

function onApiClick(event: MouseEvent) {
  remember("api");
  if (mode.value === "api") event.preventDefault();
}
</script>

<template>
  <nav class="stambha-mode-switcher" aria-label="Documentation mode">
    <a
      class="stambha-mode-switcher__pill"
      :class="{ 'is-active': mode === 'guide' }"
      :href="guideHref"
      :aria-current="mode === 'guide' ? 'page' : undefined"
      @click="onGuideClick"
    >
      Guide
    </a>
    <a
      class="stambha-mode-switcher__pill"
      :class="{ 'is-active': mode === 'api' }"
      :href="apiHref"
      :aria-current="mode === 'api' ? 'page' : undefined"
      @click="onApiClick"
    >
      API
    </a>
    <span
      class="stambha-mode-switcher__indicator"
      :class="mode === 'api' ? 'is-api' : 'is-guide'"
      aria-hidden="true"
    />
  </nav>
</template>
