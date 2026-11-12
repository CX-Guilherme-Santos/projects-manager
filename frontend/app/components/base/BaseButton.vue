<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const {
  variant = 'primary',
  size = 'md',
  type = 'button',
  to,
  icon,
  loading = false,
  disabled = false,
} = defineProps<{
  variant?: 'primary' | 'outline'
  size?: 'md' | 'lg'
  type?: 'button' | 'submit'
  to?: RouteLocationRaw
  icon?: string
  loading?: boolean
  disabled?: boolean
}>()

const classes = computed(() => [
  'btn',
  variant === 'primary' ? 'btn-primary' : 'btn-outline-primary',
  { 'btn-lg': size === 'lg' },
])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="classes"
  >
    <Icon
      v-if="icon"
      :name="icon"
      size="1.4em"
    />
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span
      v-if="loading"
      class="spinner-border spinner-border-sm"
      aria-hidden="true"
    />
    <Icon
      v-else-if="icon"
      :name="icon"
      size="1.4em"
    />
    <slot />
  </button>
</template>
