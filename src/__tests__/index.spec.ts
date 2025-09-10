import { describe, expect, test } from "bun:test"

const runProgram = async (input: string): Promise<string> => {
  const process = Bun.spawn({
    cmd: ["bun", "run", "src/index.ts"],
    stdin: "pipe",
    stdout: "pipe",
  })

  process.stdin.write(input)
  process.stdin.end()

  const output = await process.stdout.text()
  await process.exited

  return output
}

const compare = (expected: string, received: string) => {
  return expect(
    expected.trim().split("\n").map((line) => JSON.parse(line))
  ).toEqual(
    received.trim().split("\n").map((line) => JSON.parse(line))
  )
}

describe("index.ts", async () => {
  describe("test cases from document", async () => {
    test("case #0", async () => {
      const input = '[{ "operation": "buy", "unit-cost": 10.00, "quantity": 10000 },{ "operation": "sell", "unit-cost": 20.00, "quantity": 5000 }]\n[{ "operation": "buy", "unit-cost": 20.00, "quantity": 10000 },{ "operation": "sell", "unit-cost": 10.00, "quantity": 5000 }]'
      const expected = '[{"tax": 0.0},{"tax": 10000.0}]\n[{"tax": 0.0},{"tax": 0.0}]'

      const received = await runProgram(input)

      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #1", async () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]'
      const expected = '[{"tax":0},{"tax":0},{"tax":0}]'

      const received = await runProgram(input)

      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #2", async () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000}]'
      const expected = '[{"tax": 0.0}, {"tax": 10000.0}, {"tax": 0.0}]'

      const received = await runProgram(input)

      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #1 + case #2", async () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]\n[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000}]'
      const expected = '[{"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}]\n[{"tax": 0.0}, {"tax": 10000.0}, {"tax": 0.0}]'

      const received = await runProgram(input)

      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #3", async () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 3000}]'
      const expected = '[{"tax": 0.0}, {"tax": 0.0}, {"tax": 1000.0}]'

      const received = await runProgram(input)

      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #4", async () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"buy", "unit-cost":25.00, "quantity": 5000},{"operation":"sell", "unit-cost":15.00, "quantity": 10000}]'
      const expected = '[{"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}]'

      const received = await runProgram(input)

      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #5", async () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"buy", "unit-cost":25.00, "quantity": 5000},{"operation":"sell", "unit-cost":15.00, "quantity": 10000},{"operation":"sell", "unit-cost":25.00, "quantity": 5000}]'
      const expected = '[{"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}, {"tax": 10000.0}]'

      const received = await runProgram(input)

      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #6", async () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":2.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":25.00, "quantity": 1000}]'
      const expected = '[{"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}, {"tax": 3000.0}]'

      const received = await runProgram(input)

      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #7", async () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":2.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":25.00, "quantity": 1000},{"operation":"buy", "unit-cost":20.00, "quantity": 10000},{"operation":"sell", "unit-cost":15.00, "quantity": 5000},{"operation":"sell", "unit-cost":30.00, "quantity": 4350},{"operation":"sell", "unit-cost":30.00, "quantity": 650}]'
      const expected = '[{"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0},{"tax": 3000.0}, {"tax": 0.0}, {"tax": 0.0}, {"tax": 3700.0},{"tax": 0.0}]'

      const received = await runProgram(input)
      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #8", async () => {
      const input = '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":50.00, "quantity": 10000},{"operation":"buy", "unit-cost":20.00, "quantity": 10000},{"operation":"sell", "unit-cost":50.00, "quantity": 10000}]'
      const expected = '[{"tax": 0.0}, {"tax": 80000.0}, {"tax": 0.0}, {"tax": 60000.0}]'

      const received = await runProgram(input)
      expect(received).not.toBeEmpty()
      compare(expected, received)
    })

    test("case #9", async () => {
      const input = '[{"operation": "buy", "unit-cost": 5000.00, "quantity": 10},{"operation": "sell", "unit-cost": 4000.00, "quantity": 5},{"operation": "buy", "unit-cost": 15000.00, "quantity": 5},{"operation": "buy", "unit-cost": 4000.00, "quantity": 2},{"operation": "buy", "unit-cost": 23000.00, "quantity": 2},{"operation": "sell", "unit-cost": 20000.00, "quantity": 1},{"operation": "sell", "unit-cost": 12000.00, "quantity": 10},{"operation": "sell", "unit-cost": 15000.00, "quantity": 3}]'
      const expected = '[{"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}, {"tax": 0.0}, {"tax": 1000.0}, {"tax": 2400.0}]'

      const received = await runProgram(input)
      expect(received).not.toBeEmpty()
      compare(expected, received)
    })
  })
})
