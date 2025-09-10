export type Operation = {
  operation: "buy" | "sell"
  'unit-cost': number
  quantity: number
}

export type TaxResult = {
  tax: number
}
