const scrapeContractAddresses = require('./scraper')
const processContractAddresses = require('./etherrer')
// const { searchTelegramGroup, sendAlertForDetectedGroup } = require('./telegrammer')

// scrapeContractAddresses()
// processContractAddress('0xea5b5f81d8ad4e5ffa426cdceab4164bb08dfd60')
// searchTelegramGroup({
//   address: '0xea5b5f81d8ad4e5ffa426cdceab4164bb08dfd60',
//   contract: 'PartyADA'
// })

const init = async () => {
  const addresses = await scrapeContractAddresses(pages=1)
  // TODO: filter out new address occurrences in DB
  const contracts = await processContractAddresses(addresses)
  const contractsWithoutTelegram = contracts.filter(contract => !contract.telegram)
  contractsWithoutTelegram.forEach((contract) => {
    // const hasMatchingGroup = searchTelegramGroup(contract)
    // TODO: append contract name as telegram username if found
  })
  // TODO: send out message alerts for contracts that end up with a matching telegram acc
}
init()