import { Portfolio } from "./portfolio"
import type { Operation, TaxResult } from "./types"

for await (const line of console) {
  if (!line || line.length === 0) {
    break
  }

  const operations = JSON.parse(line) as Operation[]
  const portfolio = new Portfolio()

  const taxResults: TaxResult[] = []

  for (const operation of operations) {
    const tax: TaxResult = portfolio.processOperation(operation)
    taxResults.push(tax)
  }

  console.log(JSON.stringify(taxResults))
}
