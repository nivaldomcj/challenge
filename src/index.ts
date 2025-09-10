import { Portfolio } from "./portfolio"
import type { Operation, TaxResult } from "./types"

const main = async () => {
  for await (const line of console) {
    const operations = JSON.parse(line) as Operation[]
    const portfolio = new Portfolio()

    const taxResults: TaxResult[] = []

    for (const operation of operations) {
      const tax: TaxResult = portfolio.processOperation(operation)
      taxResults.push(tax)
    }

    console.log(JSON.stringify(taxResults))
  }
}

try {
  await main()
} catch (error: unknown) {
  console.error(`An error occurred: ${error}`)
}
