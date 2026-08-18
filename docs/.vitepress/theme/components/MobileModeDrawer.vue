<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter, withBase } from "vitepress";

const STORAGE_KEY = "stambha-docs-mode";

const route = useRoute();
const router = useRouter();
const open = ref(false);

function isApiPath(path: string): boolean {
  return path === "/api" || path.startsWith("/api/");
}

function close() {
  open.value = false;
}

function navigate(target: "guide" | "api") {
  close();
  const dest =
    target === "api" ? withBase("/api/") : withBase("/guide/getting-started");
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, target);
  }
  router.go(dest);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="stambha-mobile-mode">
    <button
      type="button"
      class="stambha-mobile-mode__fab"
      aria-haspopup="dialog"
      :aria-expanded="open"
      aria-label="Switch documentation mode"
      @click="open = !open"
    >
      {{ isApiPath(route.path) ? "{ }" : "📖" }}
    </button>

    <Transition name="stambha-drawer-backdrop">
      <div
        v-if="open"
        class="stambha-mobile-mode__backdrop"
        aria-hidden="true"
        @click="close"
      />
    </Transition>

    <Transition name="stambha-drawer-panel">
      <div
        v-if="open"
        class="stambha-mobile-mode__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Choose documentation mode"
      >
        <p class="stambha-mobile-mode__title">Stambha Docs</p>
        <p class="stambha-mobile-mode__subtitle">Concepts or reference</p>

        <button
          type="button"
          class="stambha-mobile-mode__card"
          :class="{ 'is-active': !isApiPath(route.path) }"
          @click="navigate('guide')"
        >
          <span class="stambha-mobile-mode__card-icon">📖</span>
          <span class="stambha-mobile-mode__card-text">
            <strong>Guide</strong>
            <small>Tutorials, features, deployment</small>
          </span>
        </button>

        <button
          type="button"
          class="stambha-mobile-mode__card"
          :class="{ 'is-active': isApiPath(route.path) }"
          @click="navigate('api')"
        >
          <span class="stambha-mobile-mode__card-icon">{ }</span>
          <span class="stambha-mobile-mode__card-text">
            <strong>API Reference</strong>
            <small>Packages, classes, types</small>
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>
