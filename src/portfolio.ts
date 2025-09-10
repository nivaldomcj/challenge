import type { Operation, TaxResult } from "./types";
import { roundNumber } from "./utils";

export class Portfolio {
  private weightedAveragePrice: number = 0
  private currentShares: number = 0
  private accumulatedLoss: number = 0

  private updateWeightedAveragePrice(unitCost: number, quantity: number): void {
    this.weightedAveragePrice = roundNumber(
      (this.currentShares * this.weightedAveragePrice + quantity * unitCost)
      / (this.currentShares + quantity)
    )
  }

  private isLoss(unitCost: number): boolean {
    return unitCost < this.weightedAveragePrice
  }

  private isExempt(unitCost: number, quantity: number): boolean {
    return unitCost * quantity <= 20000
  }

  private processSell(unitCost: number, quantity: number): TaxResult {
    this.currentShares -= quantity

    if (this.isLoss(unitCost)) {
      this.accumulatedLoss += (this.weightedAveragePrice - unitCost) * quantity
      return { tax: 0 }
    }
    if (this.isExempt(unitCost, quantity)) {
      return { tax: 0 }
    }

    const profit = (unitCost - this.weightedAveragePrice) * quantity
    const lossToUse = Math.min(profit, this.accumulatedLoss)
    const taxableProfit = profit - lossToUse

    this.accumulatedLoss -= lossToUse
    return { tax: roundNumber(taxableProfit * 0.2) }
  }

  private processBuy(unitCost: number, quantity: number): TaxResult {
    this.currentShares += quantity
    this.updateWeightedAveragePrice(unitCost, quantity)

    return { tax: 0 }
  }

  public processOperation({
    "unit-cost": unitCost,
    quantity,
    operation,
  }: Operation): TaxResult {
    switch (operation) {
      case "buy":
        return this.processBuy(unitCost, quantity)

      case "sell":
        return this.processSell(unitCost, quantity)
    }
  }
}
