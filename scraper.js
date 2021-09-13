const { Scraper, Root, CollectContent } = require('nodejs-web-scraper')

const scrapeContractAddresses = async (pages=1) => {
  const config = {
    baseSiteUrl: `https://etherscan.io`,
    startUrl: `https://etherscan.io`,
    concurrency: 1,
    maxRetries: 2,
    delay: 500,
    showConsoleLogs: false
  }

  const scraper = new Scraper(config)
  const root = new Root({ pagination: { routingString: 'contractsVerified', begin: 1, end: pages } })

  const addressesTask = new CollectContent('.table-responsive > table > tbody > tr > td:nth-child(1) > a')
  root.addOperation(addressesTask)

  await scraper.scrape(root)
  const addresses = addressesTask.data

  return addresses
}

module.exports = scrapeContractAddresses