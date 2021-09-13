const scrapeContractAddresses = require('./scraper')
const {processContractAddresses, processContractAddress} = require('./etherrer')
const { insertContract, doesExist, fetchUncheckedAddresses } = require('./db')
// const { searchTelegramGroup, sendAlertForDetectedGroup } = require('./telegrammer')

// scrapeContractAddresses()
// processContractAddress('0xea5b5f81d8ad4e5ffa426cdceab4164bb08dfd60')
// searchTelegramGroup({
//   address: '0xea5b5f81d8ad4e5ffa426cdceab4164bb08dfd60',
//   contract: 'PartyADA'
// })

const init = async () => {
  const addresses = await scrapeContractAddresses(pages=1)
  const newAddresses = [];

  while (addresses.length) {
    const newAddress = addresses.pop()
    if(await doesExist(newAddress)){
      console.log("Address already exists in the DB")
    } else {
      newAddresses.push(newAddress)
    }
  }


  const contracts = await processContractAddresses(newAddresses)
  const contractsWithoutTelegram = contracts.filter(contract => !contract.telegram)
  contractsWithoutTelegram.forEach((contract) => {
    //const hasMatchingGroup = searchTelegramGroup(contract)
    //TODO: append contract name as telegram username if found
 })

  contracts.forEach(async (result) => {
      insertContract(result);
  })

  const uncheckedAddresses = await fetchUncheckedAddresses()
  

  // TODO: send out message alerts for contracts that end up with a matching telegram acc
}
init()
