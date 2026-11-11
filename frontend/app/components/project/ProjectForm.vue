<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { projectSchema } from '~/schemas/project'
import type { Project } from '~/types/project'

const { project, save } = defineProps<{
  project?: Project
  save: (body: FormData) => Promise<unknown>
}>()
const emit = defineEmits<{ saved: [] }>()

const { defineField, errors, meta, isSubmitting, handleSubmit, setErrors } = useForm({
  validationSchema: toTypedSchema(projectSchema),
  initialValues: {
    name: project?.name ?? '',
    client: project?.client ?? '',
    start_date: project?.start_date ?? '',
    end_date: project?.end_date ?? '',
    cover: null,
  },
})

// Validates on blur; once a field shows an error it revalidates while typing
const lazyThenEager = (state: { errors: string[] }) => ({ validateOnModelUpdate: state.errors.length > 0 })
const [name, nameAttrs] = defineField('name', lazyThenEager)
const [client, clientAttrs] = defineField('client', lazyThenEager)
const [startDate, startDateAttrs] = defineField('start_date', lazyThenEager)
const [endDate, endDateAttrs] = defineField('end_date', lazyThenEager)
const [cover] = defineField('cover')
// VeeValidate types form values as deep partials; the input deals with a plain File
const coverFile = computed({
  get: () => (cover.value ?? null) as File | null,
  set: (file) => { cover.value = file },
})
const removeCover = ref(false)

const submitError = ref('')

const onSubmit = handleSubmit(async (values) => {
  submitError.value = ''
  try {
    await save(toProjectFormData(values, { removeCover: removeCover.value }))
    emit('saved')
  }
  catch (error) {
    const fieldErrors = apiValidationErrors(error)
    if (fieldErrors) setErrors(fieldErrors)
    else submitError.value = 'Não foi possível salvar o projeto. Tente novamente.'
  }
})
</script>

<template>
  <form
    class="project-form d-grid mx-auto"
    novalidate
    @submit="onSubmit"
  >
    <BaseFormField
      v-slot="field"
      label="Nome do projeto"
      required
      :error="errors.name"
    >
      <input
        :id="field.id"
        v-model="name"
        v-bind="nameAttrs"
        name="name"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': field.invalid }"
        :aria-invalid="field.invalid"
        :aria-describedby="field.describedby"
      >
    </BaseFormField>

    <BaseFormField
      v-slot="field"
      label="Cliente"
      required
      :error="errors.client"
    >
      <input
        :id="field.id"
        v-model="client"
        v-bind="clientAttrs"
        name="client"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': field.invalid }"
        :aria-invalid="field.invalid"
        :aria-describedby="field.describedby"
      >
    </BaseFormField>

    <div class="project-form__dates d-grid">
      <BaseFormField
        v-slot="field"
        label="Data de Início"
        required
        :error="errors.start_date"
      >
        <BaseDateInput
          :id="field.id"
          v-model="startDate"
          v-bind="startDateAttrs"
          name="start_date"
          icon="ph:calendar-dot-light"
          :invalid="field.invalid"
          :aria-invalid="field.invalid"
          :aria-describedby="field.describedby"
        />
      </BaseFormField>

      <BaseFormField
        v-slot="field"
        label="Data Final"
        required
        :error="errors.end_date"
      >
        <BaseDateInput
          :id="field.id"
          v-model="endDate"
          v-bind="endDateAttrs"
          name="end_date"
          icon="ph:calendar-check-light"
          :invalid="field.invalid"
          :aria-invalid="field.invalid"
          :aria-describedby="field.describedby"
        />
      </BaseFormField>
    </div>

    <BaseFormField
      v-slot="field"
      label="Capa do projeto"
      :error="errors.cover"
    >
      <ProjectCoverInput
        :id="field.id"
        v-model:file="coverFile"
        v-model:removed="removeCover"
        :current-url="project?.cover_url ?? null"
        :invalid="field.invalid"
      />
    </BaseFormField>

    <p
      v-if="submitError"
      class="project-form__error m-0 text-center"
      role="alert"
    >
      {{ submitError }}
    </p>

    <BaseButton
      type="submit"
      size="lg"
      class="w-100"
      :loading="isSubmitting"
      :disabled="!meta.valid"
    >
      Salvar projeto
    </BaseButton>
  </form>
</template>

<style scoped lang="scss">
.project-form {
  gap: 32px;
  width: min(704px, 100%);
}

.project-form__dates {
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.project-form__error {
  color: var(--pm-danger);
}

@media (max-width: 575.98px) {
  .project-form__dates {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
