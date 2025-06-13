import { render, screen } from '@testing-library/react'
import { Button } from '../button'

it('renders children correctly', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
