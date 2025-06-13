import { formatPrice } from '../utils'

const price = { currency: 'USD', unitAmount: 12345 } as any

it('formats price correctly', () => {
  expect(formatPrice(price)).toBe('$123.45')
})
