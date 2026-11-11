<script setup lang="ts">
// Header search: typing 3+ characters opens /search?q=… (debounced);
// with an empty field it lists the last searches.
const emit = defineEmits<{ close: [] }>()

const route = useRoute()
const history = useSearchHistory()

const term = ref(typeof route.query.q === 'string' ? route.query.q : '')
const focused = ref(false)
const root = useTemplateRef('root')
const input = useTemplateRef('input')

const onResultsPage = computed(() => route.path === '/search')
const showHistory = computed(() => focused.value && term.value.trim() === '' && history.terms.value.length > 0)

onMounted(() => {
  // opened from the search button: ready to type
  if (!onResultsPage.value) input.value?.focus()
})

function search(value: string) {
  if (!isSearchable(value)) return
  history.record(value)
  navigateTo({ path: '/search', query: { q: value.trim() } }, { replace: onResultsPage.value })
}

const searchWhileTyping = useDebounceFn(search, 300)
watch(term, searchWhileTyping)

function pick(saved: string) {
  term.value = saved
  search(saved)
  input.value?.blur()
  focused.value = false
}

function close() {
  focused.value = false
  if (!onResultsPage.value && term.value.trim() === '') emit('close')
}

onClickOutside(root, close)
</script>

<template>
  <div
    ref="root"
    class="search-bar position-absolute top-0 start-0 end-0 bg-white"
    :class="{ 'search-bar--expanded': showHistory }"
  >
    <form
      class="search-bar__form d-flex align-items-center gap-3"
      role="search"
      @submit.prevent="search(term)"
    >
      <Icon
        name="ph:magnifying-glass-light"
        size="26"
        class="search-bar__icon flex-shrink-0"
      />
      <input
        ref="input"
        v-model="term"
        type="search"
        class="search-bar__input flex-grow-1 border-0"
        placeholder="Digite o nome do projeto..."
        aria-label="Buscar projetos por nome ou cliente"
        autocomplete="off"
        enterkeyhint="search"
        @focus="focused = true"
        @keydown.esc="close(); input?.blur()"
      >
    </form>

    <SearchHistory
      v-if="showHistory"
      :terms="history.terms.value"
      @pick="pick"
      @remove="history.remove"
    />
  </div>
</template>

<style scoped lang="scss">
.search-bar {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.12);
}

.search-bar--expanded {
  border: 2px solid var(--pm-primary);
  border-radius: 0 0 12px 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.16);
}

.search-bar__form {
  height: var(--pm-header-height);
  padding: 0 var(--pm-page-padding-x) 0 30px;
}

.search-bar--expanded .search-bar__form {
  height: calc(var(--pm-header-height) - 2px);
  padding-left: 22px;
}

.search-bar__icon {
  color: var(--pm-primary);
}

.search-bar__input {
  min-width: 0;
  outline: 0;
  color: var(--pm-dark);
  font-size: 1.125rem;

  &::placeholder {
    color: var(--pm-gray-light);
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
}

@media (max-width: 767.98px) {
  .search-bar__form {
    padding-left: 16px;
  }
}
</style>
