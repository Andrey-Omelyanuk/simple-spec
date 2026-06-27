// story: subscribe
import { useState } from 'react'

const isValidEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)

export function Subscribe() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (done) return <p role="status">Спасибо за подписку</p>

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Введите корректный email')
      return
    }
    setError('')
    setDone(true)
  }

  return (
    <form onSubmit={submit}>
      <input
        aria-label="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      {error && <span role="alert">{error}</span>}
      <button type="submit" disabled={email.trim() === ''}>
        Подписаться
      </button>
    </form>
  )
}
