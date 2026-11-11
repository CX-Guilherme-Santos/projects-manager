<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{ project: Project, highlight?: string }>()
const emit = defineEmits<{ toggleFavorite: [], remove: [] }>()
</script>

<template>
  <article class="project-card position-relative d-flex flex-column h-100 bg-white">
    <div class="project-card__cover position-relative d-flex align-items-center justify-content-center">
      <img
        v-if="project.cover_url"
        :src="project.cover_url"
        alt=""
        class="project-card__image position-absolute top-0 start-0 w-100 h-100"
        loading="lazy"
      >
      <img
        v-else
        src="/illustrations/no-cover.svg"
        alt=""
        class="project-card__placeholder"
        width="82"
        height="68"
      >

      <div class="project-card__actions position-absolute d-flex align-items-center gap-3">
        <button
          type="button"
          class="project-card__star d-grid p-0 border-0 bg-transparent"
          :aria-pressed="project.favorite"
          :aria-label="project.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
          @click="emit('toggleFavorite')"
        >
          <img
            :src="project.favorite ? '/icons/star-filled.svg' : '/icons/star-empty.svg'"
            alt=""
            width="24"
            height="24"
          >
        </button>
        <ProjectCardMenu
          :project-id="project.id"
          @remove="emit('remove')"
        />
      </div>
    </div>

    <div class="px-4 pt-4 pb-3">
      <h2 class="project-card__name mb-2 fw-bold">
        <HighlightText
          :text="project.name"
          :term="highlight"
        />
      </h2>
      <p class="project-card__client mb-0 pb-3">
        <strong class="fw-semibold me-1">Cliente:</strong> <HighlightText
          :text="project.client"
          :term="highlight"
        />
      </p>
      <ul class="project-card__dates list-unstyled d-grid gap-3 mt-3 mb-0">
        <li class="d-flex align-items-center gap-3">
          <Icon
            name="ph:calendar-dot-light"
            size="24"
          />
          <span class="visually-hidden">Início:</span>
          <time :datetime="project.start_date">{{ formatLongDate(project.start_date) }}</time>
        </li>
        <li class="d-flex align-items-center gap-3">
          <Icon
            name="ph:calendar-check-light"
            size="24"
          />
          <span class="visually-hidden">Fim:</span>
          <time :datetime="project.end_date">{{ formatLongDate(project.end_date) }}</time>
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped lang="scss">
.project-card {
  border: 1px solid var(--pm-border);
  border-radius: 16px;
}

.project-card__cover {
  height: 232px;
  border-radius: 15px 15px 0 0;
  background: var(--pm-primary);
  // no overflow: hidden here, the options menu opens past the cover
}

.project-card__image {
  border-radius: inherit;
  object-fit: cover;
}

.project-card__actions {
  right: 16px;
  bottom: 16px;
}

.project-card__star {
  img {
    // drop-shadow follows the star outline (a box-shadow would draw a square)
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
    transition: transform 0.15s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
}

.project-card__name {
  font-size: 1.25rem;
  overflow-wrap: anywhere;
}

.project-card__client {
  border-bottom: 1px solid var(--pm-divider);
  color: var(--pm-gray);
  overflow-wrap: anywhere;
}

.project-card__dates {
  color: var(--pm-gray);
}
</style>
