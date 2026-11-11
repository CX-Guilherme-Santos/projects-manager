import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BaseDateInput from '~/components/base/BaseDateInput.vue'

const mount = (modelValue: string) =>
  mountSuspended(BaseDateInput, { props: { modelValue, icon: 'ph:calendar-dot-light' } })

describe('BaseDateInput', () => {
  it('shows the date as dd/mm/aaaa whatever the browser language', async () => {
    const field = await mount('2026-09-01')

    expect((field.get('input').element as HTMLInputElement).value).toBe('01/09/2026')
  })

  it('emits the ISO date once a typed date is complete', async () => {
    const field = await mount('')

    await field.get('input').setValue('3112')
    await field.get('input').setValue('31122026')

    expect(field.emitted('update:modelValue')!.at(-1)).toEqual(['2026-12-31'])
    expect((field.get('input').element as HTMLInputElement).value).toBe('31/12/2026')
  })

  it('picks a day in the calendar, opened on the month of the current value', async () => {
    const field = await mount('2026-09-01')

    await field.get('button[aria-label="Abrir calendário"]').trigger('click')
    expect(field.text()).toContain('setembro de 2026')
    await field.get('[data-iso="2026-09-15"]').trigger('click')

    expect(field.emitted('update:modelValue')!.at(-1)).toEqual(['2026-09-15'])
    expect(field.find('[role="dialog"]').exists()).toBe(false)
  })
})
