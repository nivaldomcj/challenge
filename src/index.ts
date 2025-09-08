const main = async () => {
  for await (const line of console) {
    console.log(line)
  }
}

try {
  await main()
} catch(error: unknown) {
  console.error(`An error occurred: ${error}`)
}
