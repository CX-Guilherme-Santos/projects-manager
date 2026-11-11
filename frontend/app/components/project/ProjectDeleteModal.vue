<script setup lang="ts">
import type { Project } from '~/types/project'

const { project, loading = false, error = '' } = defineProps<{
  project: Project | null
  loading?: boolean
  error?: string
}>()
const emit = defineEmits<{ confirm: [], cancel: [] }>()

const titleId = useId()
</script>

<template>
  <BaseModal
    :open="!!project"
    :labelledby="titleId"
    @close="loading || emit('cancel')"
  >
    <div class="delete-modal">
      <span
        class="delete-modal__icon"
        aria-hidden="true"
      >
        <Icon
          name="ph:trash-light"
          size="28"
        />
      </span>
      <h2
        :id="titleId"
        class="delete-modal__title"
      >
        Remover projeto
      </h2>
      <p class="delete-modal__text">
        Essa ação removerá definitivamente o projeto:
      </p>
      <p class="delete-modal__name">
        {{ project?.name }}
      </p>
      <p
        v-if="error"
        class="delete-modal__error"
        role="alert"
      >
        {{ error }}
      </p>
      <div class="delete-modal__actions">
        <BaseButton
          variant="outline"
          size="lg"
          :disabled="loading"
          @click="emit('cancel')"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          size="lg"
          :loading="loading"
          @click="emit('confirm')"
        >
          Confirmar
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped lang="scss">
.delete-modal {
  text-align: center;
}

.delete-modal__icon {
  position: absolute;
  top: -32px;
  left: 50%;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--pm-primary);
  color: #fff;
  box-shadow: var(--pm-shadow);
  transform: translateX(-50%);
}

.delete-modal__title {
  margin: 16px 0 0;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--pm-gray-light);
  font-size: 1.375rem;
}

.delete-modal__text {
  margin: 32px 0 12px;
  color: var(--pm-gray);
}

.delete-modal__name {
  margin: 0 0 32px;
  color: var(--pm-dark);
  font-size: 1.5625rem;
  overflow-wrap: anywhere;
}

.delete-modal__error {
  color: var(--pm-danger);
}

.delete-modal__actions {
  display: grid;
  grid-template-columns: 226fr 260fr;
  gap: 32px;
}

@media (max-width: 575.98px) {
  .delete-modal__actions {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
