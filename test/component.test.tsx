import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusMessage } from '../src/component.js'

describe('StatusMessage', () => {
  it('shows welcome message when logged in', () => {
    render(<StatusMessage isLoggedIn={true} isAdmin={false} username="Alice" />)
    expect(screen.getByText('Welcome, Alice!')).toBeDefined()
  })
})
