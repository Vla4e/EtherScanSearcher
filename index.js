const scrapeContractAddresses = require('./scraper')
const {processContractAddresses} = require('./etherrer')
const { insertContract, updateContract, doesExist, fetchStubbornNotTelegram } = require('./db')
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

  const contracts = (await processContractAddresses(newAddresses)).filter(x => x)
  contracts.forEach(async (result) => {
    await insertContract(result);
  })

  await Promise.all(contracts.map(contract => insertContract(contract)))

  const contractsNeedTdlibCheck = await fetchStubbornNotTelegram()
  await Promise.all(contractsNeedTdlibCheck.map(contract => {
    const hasMatchingGroup = searchTelegramGroup(contract)
    if (hasMatchingGroup) {
      return updateContract(contract.address, contract.contract)
    }
    return Promise.resolve()
  }))

  // TODO: send out message alerts for contracts that end up with a matching telegram acc
}
init()
