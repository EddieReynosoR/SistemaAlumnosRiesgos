import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function HelloComponent() {
  return <h1>Hola Mundo</h1>
}

describe('Simple React test', () => {
  it('renderiza el texto', () => {
    render(<HelloComponent />)
    expect(screen.getByText('Hola Mundo')).toBeDefined()
  })
})
