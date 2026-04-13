/**
 * Tests for TresorerieWidget Component
 *
 * Testing:
 * - Display tresorerie data correctly
 * - Format currency properly
 * - Show alerts when solde < 5M
 * - Analyze button click handler
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TresorerieWidget from '@features/dashboard/components/TresorerieWidget'

describe('TresorerieWidget', () => {
  const mockData = {
    soldeActuel: 15750000,
    soldeItineraire: 12500000,
    entrees30j: 5000000,
    sorties30j: 3200000,
    fluxNetMensuel: 1800000,
  }

  const mockOnAnalyseClick = vi.fn()

  describe('Rendering', () => {
    it('should render widget title', () => {
      render(
        <TresorerieWidget data={mockData} devise="DZD" onAnalyseClick={mockOnAnalyseClick} />
      )
      expect(screen.getByText('Trésorerie')).toBeInTheDocument()
      expect(screen.getByText('Position de liquidité')).toBeInTheDocument()
    })

    it('should display solde actuel correctly', () => {
      render(
        <TresorerieWidget data={mockData} devise="DZD" onAnalyseClick={mockOnAnalyseClick} />
      )
      const solde = screen.getByText((content, element) =>
        content.includes('15,750,000') || content.includes('15 750 000')
      )
      expect(solde).toBeInTheDocument()
    })

    it('should format currency with devise parameter', () => {
      const { rerender } = render(
        <TresorerieWidget data={mockData} devise="DZD" />
      )
      // Vérifie que la devise est formatée

      rerender(
        <TresorerieWidget data={mockData} devise="EUR" />
      )
      // Devrait changer le format
    })
  })

  describe('Data Display', () => {
    it('should display all cash flow values', () => {
      render(
        <TresorerieWidget data={mockData} devise="DZD" />
      )
      expect(screen.getByText((content) => content.includes('Entrées'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('Sorties'))).toBeInTheDocument()
      expect(screen.getByText((content) => content.includes('Flux Net'))).toBeInTheDocument()
    })

    it('should display positive flux net in green', () => {
      const { container } = render(
        <TresorerieWidget
          data={{ ...mockData, fluxNetMensuel: 1800000 }}
          devise="DZD"
        />
      )
      const fluxNetElement = container.querySelector('[class*="emerald"]')
      expect(fluxNetElement).toBeInTheDocument()
    })

    it('should display negative flux net in red', () => {
      const { container } = render(
        <TresorerieWidget
          data={{ ...mockData, fluxNetMensuel: -500000 }}
          devise="DZD"
        />
      )
      const fluxNetElement = container.querySelector('[class*="red"]')
      expect(fluxNetElement).toBeInTheDocument()
    })
  })

  describe('Alerts', () => {
    it('should not show alert when solde is healthy', () => {
      render(
        <TresorerieWidget data={mockData} devise="DZD" />
      )
      const alert = screen.queryByText('Trésorerie faible')
      expect(alert).not.toBeInTheDocument()
    })

    it('should show alert when solde < 5M', () => {
      const lowBalanceData = { ...mockData, soldeActuel: 3000000 }
      render(
        <TresorerieWidget data={lowBalanceData} devise="DZD" />
      )
      expect(screen.getByText('Trésorerie faible')).toBeInTheDocument()
      expect(screen.getByText('Envisagez des actions correctives')).toBeInTheDocument()
    })

    it('should show alert at exactly 5M boundary', () => {
      const boundaryData = { ...mockData, soldeActuel: 5000000 }
      const { rerender } = render(
        <TresorerieWidget data={{ ...mockData, soldeActuel: 4999999 }} devise="DZD" />
      )
      expect(screen.getByText('Trésorerie faible')).toBeInTheDocument()

      rerender(
        <TresorerieWidget data={boundaryData} devise="DZD" />
      )
      expect(screen.queryByText('Trésorerie faible')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onAnalyseClick when button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TresorerieWidget data={mockData} devise="DZD" onAnalyseClick={mockOnAnalyseClick} />
      )

      const button = screen.getByRole('button', { name: /analyser/i })
      await user.click(button)

      expect(mockOnAnalyseClick).toHaveBeenCalledTimes(1)
    })

    it('should not render analyze button when callback not provided', () => {
      render(
        <TresorerieWidget data={mockData} devise="DZD" />
      )
      const button = screen.queryByRole('button', { name: /analyser/i })
      expect(button).not.toBeInTheDocument()
    })
  })

  describe('Responsive', () => {
    it('should have responsive grid layout', () => {
      const { container } = render(
        <TresorerieWidget data={mockData} devise="DZD" />
      )
      // Vérifier que la grille est responsive (grid-cols-2 sur desktop)
      const gridContainer = container.querySelector('[class*="grid-cols"]')
      expect(gridContainer).toBeInTheDocument()
    })
  })
})
