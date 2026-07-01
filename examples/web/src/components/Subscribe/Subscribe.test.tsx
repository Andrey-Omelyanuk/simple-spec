// object: subscribe-form
import { render, screen, fireEvent } from '@testing-library/react'
import { Subscribe } from './Subscribe'

describe("Subscribe (object: subscribe-form)", () => {
  // Сценарий 3: пустое поле → кнопка неактивна
  it('disables the button when the field is empty', () => {
    render(<Subscribe />)
    expect(screen.getByRole('button', { name: 'Подписаться' })).toBeDisabled()
  })

  // Сценарий 2: некорректный email → ошибка, форма не отправлена
  it('shows an error for an invalid email', () => {
    render(<Subscribe />)
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: 'Подписаться' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Введите корректный email')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  // Сценарий 1: корректный email → благодарность
  it('confirms subscription for a valid email', () => {
    render(<Subscribe />)
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Подписаться' }))
    expect(screen.getByRole('status')).toHaveTextContent('Спасибо за подписку')
  })
})
