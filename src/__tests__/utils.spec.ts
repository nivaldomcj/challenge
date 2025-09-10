import { describe, expect, it } from "bun:test"
import { roundNumber } from "../utils"

describe("utils.ts", async () => {
  describe("roundNumber", async () => {
    it("should round up when third decimal is >= 5", () => {
      expect(roundNumber(1.235)).toBe(1.24)
      expect(roundNumber(10.126)).toBe(10.13)
      expect(roundNumber(5.999)).toBe(6.00)
    })

    it("should round down when third decimal is < 5", () => {
      expect(roundNumber(1.234)).toBe(1.23)
      expect(roundNumber(10.124)).toBe(10.12)
      expect(roundNumber(5.991)).toBe(5.99)
    })

    it("should handle numbers with exactly 2 decimal places", () => {
      expect(roundNumber(1.23)).toBe(1.23)
      expect(roundNumber(10.50)).toBe(10.50)
      expect(roundNumber(0.99)).toBe(0.99)
    })

    it("should handle whole numbers", () => {
      expect(roundNumber(5)).toBe(5)
      expect(roundNumber(100)).toBe(100)
      expect(roundNumber(0)).toBe(0)
    })

    it("should handle negative numbers", () => {
      expect(roundNumber(-1.235)).toBe(-1.24)
      expect(roundNumber(-1.234)).toBe(-1.23)
      expect(roundNumber(-10.50)).toBe(-10.50)
      expect(roundNumber(-5)).toBe(-5)
    })

    it("should handle very small numbers", () => {
      expect(roundNumber(0.001)).toBe(0.00)
      expect(roundNumber(0.004)).toBe(0.00)
      expect(roundNumber(0.005)).toBe(0.01)
      expect(roundNumber(0.006)).toBe(0.01)
    })

    it("should handle numbers with many decimal places", () => {
      expect(roundNumber(1.23456789)).toBe(1.23)
      expect(roundNumber(9.87654321)).toBe(9.88)
      expect(roundNumber(3.14159265)).toBe(3.14)
    })

    it("should handle edge case with .5 in third decimal", () => {
      expect(roundNumber(1.225)).toBe(1.23)
      expect(roundNumber(2.235)).toBe(2.24)
      expect(roundNumber(3.245)).toBe(3.25)
    })
  })
})
