<script setup lang="ts">
defineProps<{ label: string }>()
const checked = defineModel<boolean>({ required: true })
const id = useId()
</script>

<template>
  <div class="base-switch form-check form-switch d-flex align-items-center m-0 p-0">
    <input
      :id="id"
      v-model="checked"
      class="form-check-input m-0"
      type="checkbox"
      role="switch"
    >
    <label
      class="form-check-label text-nowrap"
      :for="id"
    >{{ label }}</label>
  </div>
</template>

<style scoped lang="scss">
.base-switch {
  gap: 10px;
  min-height: 0;

  .form-check-input {
    width: 46px;
    height: 24px;
    cursor: pointer;
    // keeps the knob white on both states
    --bs-form-switch-bg: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='2.6' fill='%23fff'/%3e%3c/svg%3e");
  }

  .form-check-label {
    cursor: pointer;
  }
}
</style>
