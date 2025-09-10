import { beforeEach, describe, expect, it } from "bun:test"
import { Portfolio } from "../portfolio"
import type { Operation } from "../types"

describe("Portfolio", () => {
  let portfolio: Portfolio

  beforeEach(() => {
    portfolio = new Portfolio()
  })

  describe("buy operations", () => {
    it("should process single buy operation with zero tax", () => {
      const operation: Operation = {
        operation: "buy",
        "unit-cost": 10.00,
        quantity: 100
      }

      const result = portfolio.processOperation(operation)
      expect(result).toEqual({ tax: 0 })
    })

    it("should calculate weighted average price correctly with multiple buys", () => {
      // First buy: 100 shares at R$ 10 = weighted average R$ 10
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 10.00,
        quantity: 100
      })

      // Second buy: 100 shares at R$ 20 = weighted average R$ 15
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 20.00,
        quantity: 100
      })

      // Sell at R$ 16 (profit of R$ 1 per share, total R$ 100 profit)
      // Should be exempt (16 * 100 = 1600 <= 20000)
      const result = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 16.00,
        quantity: 100
      })

      expect(result).toEqual({ tax: 0 })
    })
  })

  describe("sell operations - losses", () => {
    it("should handle loss and accumulate it with zero tax", () => {
      // Buy 100 shares at R$ 20
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 20.00,
        quantity: 100
      })

      // Sell 50 shares at R$ 15 (loss of R$ 5 per share = R$ 250 total loss)
      const result = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 15.00,
        quantity: 50
      })

      expect(result).toEqual({ tax: 0 })
    })

    it("should accumulate multiple losses", () => {
      // Buy 200 shares at R$ 10
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 10.00,
        quantity: 200
      })

      // First loss: sell 100 at R$ 8 (loss of R$ 2 per share = R$ 200)
      const result1 = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 8.00,
        quantity: 100
      })

      // Second loss: sell 50 at R$ 7 (loss of R$ 3 per share = R$ 150)
      const result2 = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 7.00,
        quantity: 50
      })

      expect(result1).toEqual({ tax: 0 })
      expect(result2).toEqual({ tax: 0 })
    })
  })

  describe("sell operations - exempt (≤ 20000)", () => {
    it("should be tax exempt when total sale is exactly 20000", () => {
      // Buy 1000 shares at R$ 10
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 10.00,
        quantity: 1000
      })

      // Sell 1000 shares at R$ 20 (total = 20000, should be exempt)
      const result = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 20.00,
        quantity: 1000
      })

      expect(result).toEqual({ tax: 0 })
    })

    it("should be tax exempt when total sale is less than 20000", () => {
      // Buy 100 shares at R$ 50
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 50.00,
        quantity: 100
      })

      // Sell 100 shares at R$ 100 (total = 10000 < 20000, should be exempt)
      const result = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 100.00,
        quantity: 100
      })

      expect(result).toEqual({ tax: 0 })
    })
  })

  describe("sell operations - taxable profits", () => {
    it("should calculate tax on profit when sale > 20000", () => {
      // Buy 1000 shares at R$ 10
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 10.00,
        quantity: 1000
      })

      // Sell 1000 shares at R$ 25 (total = 25000 > 20000)
      // Profit = (25 - 10) * 1000 = 15000
      // Tax = 15000 * 0.2 = 3000
      const result = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 25.00,
        quantity: 1000
      })

      expect(result).toEqual({ tax: 3000 })
    })

    it("should calculate tax correctly with decimal values", () => {
      // Buy 1000 shares at R$ 12.50
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 12.50,
        quantity: 1000
      })

      // Sell 1000 shares at R$ 35.75 (total = 35750 > 20000)
      // Profit = (35.75 - 12.50) * 1000 = 23250
      // Tax = 23250 * 0.2 = 4650
      const result = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 35.75,
        quantity: 1000
      })

      expect(result).toEqual({ tax: 4650 })
    })
  })

  describe("sell operations - using accumulated losses", () => {
    it("should use accumulated losses to offset taxable profits", () => {
      // Buy 200 shares at R$ 20
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 20.00,
        quantity: 200
      })

      // First: Sell 100 at R$ 10 (loss of R$ 10 per share = R$ 1000 accumulated loss)
      const lossResult = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 10.00,
        quantity: 100
      })

      // Buy more shares to continue
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 15.00,
        quantity: 1500
      })

      // Sell 1500 shares at R$ 25 (total = 37500 > 20000)
      // Weighted average after second buy: (100*20 + 1500*15) / 1600 = 15.3125, rounded to 15.31
      // Profit = (25 - 15.31) * 1500 = 9.69 * 1500 = 14535
      // After using R$ 1000 accumulated loss: 14535 - 1000 = 13535
      // Tax = 13535 * 0.2 = 2707
      const profitResult = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 25.00,
        quantity: 1500
      })

      expect(lossResult).toEqual({ tax: 0 })
      expect(profitResult).toEqual({ tax: 2707 })
    })

    it("should use only partial accumulated loss when profit is smaller", () => {
      // Create large accumulated loss
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 100.00,
        quantity: 100
      })

      // Sell at big loss: (100 - 50) * 100 = R$ 5000 accumulated loss
      portfolio.processOperation({
        operation: "sell",
        "unit-cost": 50.00,
        quantity: 100
      })

      // Buy more shares
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 10.00,
        quantity: 3000
      })

      // Sell with smaller profit: (15 - 10) * 3000 = R$ 15000 profit
      // Should use R$ 5000 of accumulated loss, leaving R$ 10000 taxable
      // Tax = 10000 * 0.2 = 2000
      const result = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 15.00,
        quantity: 3000
      })

      expect(result).toEqual({ tax: 2000 })
    })
  })

  describe("complex scenarios", () => {
    it("should handle the example from case #1", () => {
      // This reproduces the test case from index.spec.ts
      const operations: Operation[] = [
        { operation: "buy", "unit-cost": 10.00, quantity: 100 },
        { operation: "sell", "unit-cost": 15.00, quantity: 50 },
        { operation: "sell", "unit-cost": 15.00, quantity: 50 }
      ]

      const results = operations.map(op => portfolio.processOperation(op))

      expect(results).toEqual([
        { tax: 0 },  // Buy operation
        { tax: 0 },  // Sell 50 * 15 = 750 (exempt)
        { tax: 0 }   // Sell 50 * 15 = 750 (exempt)
      ])
    })

    it("should handle multiple operations with varying profits and losses", () => {
      const operations: Operation[] = [
        { operation: "buy", "unit-cost": 20.00, quantity: 10000 },  // Buy 10k shares at R$ 20
        { operation: "sell", "unit-cost": 25.00, quantity: 5000 }, // Sell 5k at R$ 25, profit=25k, tax=5k
        { operation: "sell", "unit-cost": 15.00, quantity: 5000 }, // Sell 5k at R$ 15, loss=25k
      ]

      const results = operations.map(op => portfolio.processOperation(op))

      expect(results).toEqual([
        { tax: 0 },    // Buy
        { tax: 5000 }, // Taxable profit: (25-20)*5000*0.2 = 5000
        { tax: 0 }     // Loss
      ])
    })
  })

  describe("edge cases", () => {
    it("should handle sell at exact weighted average price", () => {
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 15.00,
        quantity: 100
      })

      // Sell at exact weighted average (no profit, no loss)
      const result = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 15.00,
        quantity: 50
      })

      expect(result).toEqual({ tax: 0 })
    })

    it("should handle rounding in tax calculations", () => {
      portfolio.processOperation({
        operation: "buy",
        "unit-cost": 10.00,
        quantity: 1000
      })

      // Create a scenario that results in fractional tax
      // Profit = (22.33 - 10) * 1000 = 12330
      // Tax = 12330 * 0.2 = 2466
      const result = portfolio.processOperation({
        operation: "sell",
        "unit-cost": 22.33,
        quantity: 1000
      })

      expect(result).toEqual({ tax: 2466 })
    })
  })
})
