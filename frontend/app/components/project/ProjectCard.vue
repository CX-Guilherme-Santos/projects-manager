<script setup lang="ts">
import type { Project } from '~/types/project'

defineProps<{ project: Project, highlight?: string }>()
const emit = defineEmits<{ toggleFavorite: [], remove: [] }>()
</script>

<template>
  <article class="project-card">
    <div class="project-card__cover">
      <img
        v-if="project.cover_url"
        :src="project.cover_url"
        alt=""
        class="project-card__image"
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

      <div class="project-card__actions">
        <button
          type="button"
          class="project-card__star"
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

    <div class="project-card__body">
      <h2 class="project-card__name">
        <HighlightText
          :text="project.name"
          :term="highlight"
        />
      </h2>
      <p class="project-card__client">
        <strong>Cliente:</strong> <HighlightText
          :text="project.client"
          :term="highlight"
        />
      </p>
      <ul class="project-card__dates">
        <li>
          <Icon
            name="ph:calendar-dot-light"
            size="24"
          />
          <span class="visually-hidden">Início:</span>
          <time :datetime="project.start_date">{{ formatLongDate(project.start_date) }}</time>
        </li>
        <li>
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
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--pm-border);
  border-radius: 16px;
  background: #fff;
}

.project-card__cover {
  position: relative;
  height: 232px;
  display: grid;
  place-items: center;
  border-radius: 15px 15px 0 0;
  background: var(--pm-primary);
  // no overflow: hidden here, the options menu opens past the cover
}

.project-card__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

.project-card__actions {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.project-card__star {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: none;

  img {
    // drop-shadow follows the star outline (a box-shadow would draw a square)
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
    transition: transform 0.15s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
}

.project-card__body {
  padding: 24px 24px 16px;
}

.project-card__name {
  margin: 0 0 8px;
  font-size: 1.25rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.project-card__client {
  margin: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--pm-divider);
  color: var(--pm-gray);
  overflow-wrap: anywhere;

  strong {
    margin-right: 4px;
    font-weight: 600;
  }
}

.project-card__dates {
  display: grid;
  gap: 16px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  color: var(--pm-gray);

  li {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}
</style>
