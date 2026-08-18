<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter, withBase } from "vitepress";

const STORAGE_KEY = "stambha-docs-mode";

const route = useRoute();
const router = useRouter();

const mode = computed<"guide" | "api">(() => {
  const path = route.path;
  return path === "/api" || path.startsWith("/api/") ? "api" : "guide";
});

function navigate(target: "guide" | "api") {
  if (target === mode.value) return;

  const dest =
    target === "api" ? withBase("/api/") : withBase("/guide/getting-started");

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, target);
  }

  const go = () => {
    router.go(dest);
  };

  if (typeof document !== "undefined" && "startViewTransition" in document) {
    (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(go);
  } else {
    go();
  }
}
</script>

<template>
  <div
    class="stambha-mode-switcher"
    role="tablist"
    aria-label="Documentation mode"
  >
    <button
      type="button"
      role="tab"
      class="stambha-mode-switcher__pill"
      :class="{ 'is-active': mode === 'guide' }"
      :aria-selected="mode === 'guide'"
      @click="navigate('guide')"
    >
      <span class="stambha-mode-switcher__icon" aria-hidden="true">📖</span>
      <span class="stambha-mode-switcher__label">Guide</span>
    </button>
    <button
      type="button"
      role="tab"
      class="stambha-mode-switcher__pill"
      :class="{ 'is-active': mode === 'api' }"
      :aria-selected="mode === 'api'"
      @click="navigate('api')"
    >
      <span class="stambha-mode-switcher__icon" aria-hidden="true">{ }</span>
      <span class="stambha-mode-switcher__label">API</span>
    </button>
    <span
      class="stambha-mode-switcher__indicator"
      :class="mode === 'api' ? 'is-api' : 'is-guide'"
      aria-hidden="true"
    />
  </div>
</template>
