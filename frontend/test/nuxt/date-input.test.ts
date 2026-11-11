import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BaseDateInput from '~/components/base/BaseDateInput.vue'

const mount = (modelValue: string) =>
  mountSuspended(BaseDateInput, {
    props: { modelValue, icon: 'ph:calendar-dot-light' },
    attachTo: document.body,
  })

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

  it('opens the calendar when the field is clicked, keeping the focus to type', async () => {
    const field = await mount('2026-09-01')
    const input = field.get('input')
    input.element.focus()

    await input.trigger('click')

    expect(field.find('[role="dialog"]').exists()).toBe(true)
    expect(document.activeElement).toBe(input.element)
    field.unmount()
  })

  it('follows a typed date with the calendar open', async () => {
    const field = await mount('2026-09-01')
    await field.get('input').trigger('click')

    await field.get('input').setValue('10122026')
    await field.setProps({ modelValue: '2026-12-10' })

    expect(field.text()).toContain('dezembro de 2026')
    field.unmount()
  })

  it('closes on Tab from the field, instead of tabbing into the calendar', async () => {
    const field = await mount('2026-09-01')
    await field.get('input').trigger('click')

    await field.get('input').trigger('keydown', { key: 'Tab' })

    expect(field.find('[role="dialog"]').exists()).toBe(false)
    field.unmount()
  })

  it('closes when the focus leaves the field', async () => {
    const field = await mount('2026-09-01')
    await field.get('input').trigger('click')

    await field.get('.date-input').trigger('focusout', { relatedTarget: document.body })

    expect(field.find('[role="dialog"]').exists()).toBe(false)
    field.unmount()
  })
})
