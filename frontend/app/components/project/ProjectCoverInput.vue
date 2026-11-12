<script setup lang="ts">
const { currentUrl, invalid = false, id } = defineProps<{
  currentUrl: string | null
  invalid?: boolean
  id?: string
}>()
// file: newly chosen image; removed: the saved cover should be deleted on save
const file = defineModel<File | null>('file', { default: null })
const removed = defineModel<boolean>('removed', { default: false })

const picker = useTemplateRef('picker')
const dragging = ref(false)

// Local preview of the chosen file; the object URL is released when replaced or unmounted
const filePreview = ref<string | null>(null)
watch(file, (chosen) => {
  if (filePreview.value) URL.revokeObjectURL(filePreview.value)
  filePreview.value = chosen ? URL.createObjectURL(chosen) : null
}, { immediate: true })
onBeforeUnmount(() => filePreview.value && URL.revokeObjectURL(filePreview.value))

const preview = computed(() => filePreview.value ?? (removed.value ? null : currentUrl))

function choose(chosen: File | undefined) {
  if (!chosen) return
  file.value = chosen
}

function onDrop(event: DragEvent) {
  dragging.value = false
  choose(event.dataTransfer?.files[0])
}

function clear() {
  if (file.value) file.value = null
  if (currentUrl) removed.value = true
  if (picker.value) picker.value.value = ''
}
</script>

<template>
  <div class="cover-input">
    <input
      :id="id"
      ref="picker"
      type="file"
      name="cover"
      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
      class="visually-hidden"
      tabindex="-1"
      @change="choose(($event.target as HTMLInputElement).files?.[0])"
    >

    <div
      v-if="preview"
      class="cover-input__preview position-relative overflow-hidden"
    >
      <img
        :src="preview"
        alt="Capa do projeto"
        class="w-100 h-100"
      >
      <button
        type="button"
        class="cover-input__remove position-absolute d-grid p-0 border-0 rounded-circle bg-white"
        aria-label="Remover capa"
        @click="clear"
      >
        <Icon
          name="ph:trash-light"
          size="20"
        />
      </button>
    </div>

    <div
      v-else
      class="cover-input__dropzone d-flex flex-column align-items-center gap-3 text-center"
      :class="{ 'cover-input__dropzone--active': dragging, 'cover-input__dropzone--invalid': invalid }"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <Icon
        name="ph:tray-arrow-up-light"
        size="28"
      />
      <p class="m-0">
        Escolha uma imagem .jpg ou .png no seu dispositivo
      </p>
      <BaseButton
        variant="outline"
        @click="picker?.click()"
      >
        Selecionar
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cover-input__dropzone {
  padding: 20px 16px 24px;
  border: 1px dashed var(--pm-gray);
  border-radius: 4px;
  color: var(--pm-gray);

  .btn {
    min-width: 144px;
  }
}

.cover-input__dropzone--active {
  border-color: var(--pm-primary);
  background: #fff;
}

.cover-input__dropzone--invalid {
  border-color: var(--pm-danger);
}

.cover-input__preview {
  aspect-ratio: 702 / 395;
  border-radius: 4px;

  img {
    object-fit: cover;
  }
}

.cover-input__remove {
  top: 24px;
  right: 24px;
  width: 32px;
  height: 32px;
  place-items: center;
  color: var(--pm-primary);
  box-shadow: var(--pm-shadow);
}
</style>
