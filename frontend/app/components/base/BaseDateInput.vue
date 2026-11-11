<script setup lang="ts">
// Date field in dd/mm/aaaa (typed with a mask or picked in the calendar), whatever the
// browser language. The native <input type="date"> follows the browser locale
// (mm/dd/yyyy in an English Chrome) and its picker cannot be styled.
// v-model is the ISO date the API uses ("2026-12-01"), or "" while incomplete.
defineOptions({ inheritAttrs: false })
const { icon, invalid = false } = defineProps<{ icon: string, invalid?: boolean }>()
const value = defineModel<string>({ default: '' })

// VeeValidate's field attrs: onBlur validates; its onInput/onChange would store the
// typed text instead of the ISO date, so the model is updated here instead.
const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { onInput: _onInput, onChange: _onChange, ...rest } = attrs
  return rest
})
const notifyBlur = () => (attrs.onBlur as ((event?: Event) => void) | undefined)?.()

const text = ref(value.value ? formatBrDate(value.value) : '')
watch(value, (iso) => {
  if (iso && parseBrDate(text.value) !== iso) text.value = formatBrDate(iso)
})

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  text.value = maskBrDate(input.value)
  input.value = text.value
  value.value = parseBrDate(text.value) ?? ''
}

// --- calendar ---
const root = useTemplateRef('root')
const input = useTemplateRef('input')
const grid = useTemplateRef('grid')
const open = ref(false)
const view = ref({ year: 0, month: 0 })
const focusedDay = ref('')
const calendarId = useId()

const MONTH_LABEL = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const DAY_LABEL = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const WEEKDAYS = [
  ['D', 'domingo'], ['S', 'segunda'], ['T', 'terça'], ['Q', 'quarta'], ['Q', 'quinta'], ['S', 'sexta'], ['S', 'sábado'],
] as const

const weeks = computed(() => calendarWeeks(view.value.year, view.value.month))
const monthLabel = computed(() => MONTH_LABEL.format(new Date(Date.UTC(view.value.year, view.value.month, 1))))

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
const today = todayIso()

function showMonthOf(iso: string) {
  const [year, month] = iso.split('-').map(Number) as [number, number]
  view.value = { year, month: month - 1 }
}

async function focusDay(iso: string) {
  focusedDay.value = iso
  showMonthOf(iso)
  await nextTick()
  grid.value?.querySelector<HTMLElement>(`[data-iso="${iso}"]`)?.focus()
}

function openCalendar() {
  open.value = true
  focusDay(value.value || today)
}

function close({ returnFocus = false } = {}) {
  open.value = false
  if (returnFocus) input.value?.focus()
}

function changeMonth(step: number) {
  const date = new Date(Date.UTC(view.value.year, view.value.month + step, 1))
  view.value = { year: date.getUTCFullYear(), month: date.getUTCMonth() }
  focusedDay.value = ''
}

function pick(iso: string) {
  value.value = iso
  text.value = formatBrDate(iso)
  close({ returnFocus: true })
  notifyBlur()
}

function onGridKeydown(event: KeyboardEvent) {
  const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
  const step = moves[event.key]
  if (step === undefined) return
  event.preventDefault()
  focusDay(addDays(focusedDay.value || value.value || today, step))
}

onClickOutside(root, () => open.value && close())
</script>

<template>
  <div
    ref="root"
    class="date-input"
    :class="{ 'date-input--invalid': invalid, 'date-input--open': open }"
    @keydown.esc="open && close({ returnFocus: true })"
  >
    <input
      ref="input"
      v-bind="inputAttrs"
      :value="text"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      maxlength="10"
      class="form-control"
      :class="{ 'is-invalid': invalid }"
      @input="onInput"
    >
    <button
      type="button"
      class="date-input__toggle"
      aria-label="Abrir calendário"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="calendarId"
      @click="open ? close() : openCalendar()"
    >
      <Icon
        :name="icon"
        size="26"
      />
    </button>

    <div
      v-if="open"
      :id="calendarId"
      class="calendar"
      role="dialog"
      aria-modal="false"
      :aria-label="`Calendário, ${monthLabel}`"
    >
      <div class="calendar__header">
        <button
          type="button"
          class="calendar__nav"
          aria-label="Mês anterior"
          @click="changeMonth(-1)"
        >
          <Icon
            name="ph:caret-left-light"
            size="20"
          />
        </button>
        <span
          class="calendar__month"
          aria-live="polite"
        >{{ monthLabel }}</span>
        <button
          type="button"
          class="calendar__nav"
          aria-label="Próximo mês"
          @click="changeMonth(1)"
        >
          <Icon
            name="ph:caret-right-light"
            size="20"
          />
        </button>
      </div>

      <table
        ref="grid"
        class="calendar__grid"
        role="grid"
        @keydown="onGridKeydown"
      >
        <thead>
          <tr>
            <th
              v-for="([short, full], index) in WEEKDAYS"
              :key="index"
              scope="col"
              :abbr="full"
            >
              {{ short }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(week, index) in weeks"
            :key="index"
          >
            <td
              v-for="day in week"
              :key="day.iso"
            >
              <button
                type="button"
                class="calendar__day"
                :class="{
                  'calendar__day--outside': !day.inMonth,
                  'calendar__day--today': day.iso === today,
                  'calendar__day--selected': day.iso === value,
                }"
                :data-iso="day.iso"
                :tabindex="day.iso === (focusedDay || value || today) ? 0 : -1"
                :aria-label="DAY_LABEL.format(new Date(`${day.iso}T00:00:00Z`))"
                :aria-pressed="day.iso === value"
                @click="pick(day.iso)"
              >
                {{ day.day }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.date-input {
  position: relative;

  .form-control {
    padding-right: 48px;
  }
}

.date-input__toggle {
  position: absolute;
  top: 7px;
  right: 8px;
  display: grid;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: none;
  color: var(--pm-gray);

  &:hover,
  &:focus-visible {
    color: var(--pm-primary);
  }
}

.date-input--open .date-input__toggle {
  color: var(--pm-primary);
}

.date-input--invalid .date-input__toggle {
  color: var(--pm-danger);
}

.calendar {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 30;
  width: 304px;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
}

.calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.calendar__month {
  color: var(--pm-heading);
  font-weight: 600;

  &::first-letter {
    text-transform: uppercase;
  }
}

.calendar__nav {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--pm-primary);

  &:hover,
  &:focus-visible {
    background: var(--pm-bg);
  }
}

.calendar__grid {
  width: 100%;
  border-collapse: collapse;
  text-align: center;

  th {
    padding-bottom: 6px;
    color: var(--pm-gray);
    font-size: 0.8125rem;
    font-weight: 400;
  }

  td {
    padding: 2px 0;
  }
}

.calendar__day {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 50%;
  background: none;
  color: var(--pm-dark);
  font-size: 0.875rem;

  &:hover {
    background: var(--pm-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--pm-primary);
    outline-offset: 1px;
  }
}

.calendar__day--outside {
  color: var(--pm-gray-light);
}

.calendar__day--today {
  border-color: var(--pm-primary);
  color: var(--pm-primary);
}

.calendar__day--selected,
.calendar__day--selected:hover {
  background: var(--pm-primary);
  border-color: var(--pm-primary);
  color: #fff;
}
</style>
