// object: subscribe-form
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import { Subscribe } from './Subscribe'

const meta: Meta<typeof Subscribe> = {
  title: 'Subscribe',
  component: Subscribe,
}
export default meta

type Story = StoryObj<typeof Subscribe>

// Сценарий 1: корректный email → благодарность
export const ValidEmail: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await userEvent.type(c.getByLabelText('email'), 'a@b.com')
    await userEvent.click(c.getByRole('button', { name: 'Подписаться' }))
    await expect(c.getByRole('status')).toHaveTextContent('Спасибо за подписку')
  },
}

// Сценарий 2: некорректный email → ошибка
export const InvalidEmail: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await userEvent.type(c.getByLabelText('email'), 'nope')
    await userEvent.click(c.getByRole('button', { name: 'Подписаться' }))
    await expect(c.getByRole('alert')).toHaveTextContent('Введите корректный email')
  },
}

// Сценарий 3: пустое поле → кнопка неактивна
export const EmptyField: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement)
    await expect(c.getByRole('button', { name: 'Подписаться' })).toBeDisabled()
  },
}
