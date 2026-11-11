<script setup lang="ts">
const { text, term = '' } = defineProps<{ text: string, term?: string }>()

// Rendered as text nodes and <mark>, never v-html: a project name can't inject markup
const segments = computed(() => splitHighlight(text, term))
</script>

<template>
  <template
    v-for="(segment, index) in segments"
    :key="index"
  >
    <mark
      v-if="segment.match"
      class="highlight"
    >{{ segment.text }}</mark>
    <template v-else>
      {{ segment.text }}
    </template>
  </template>
</template>

<style scoped lang="scss">
.highlight {
  padding: 0;
  background: var(--pm-accent);
  color: #fff;
}
</style>
