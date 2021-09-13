const cron = require('node-cron')

const scrapeContractAddresses = require('./scraper')
const { processContractAddresses } = require('./etherrer')
const { insertContract, updateContract, doesExist, fetchStubbornNotTelegram, fetchWithPendingAlert } = require('./db')
const { searchTelegramGroup, sendAlertForDetectedGroup } = require('./telegrammer')

const runIteration = async () => {
  console.log('Iteration start!')

  const addresses = await scrapeContractAddresses(pages=1)
  const newAddresses = []

  while (addresses.length) {
    const newAddress = addresses.pop()
    if (!await doesExist(newAddress)) {
      newAddresses.push(newAddress)
    }
  }

  const contracts = (await processContractAddresses(newAddresses)).filter(x => x)
  await Promise.all(contracts.map(async contract => await insertContract(contract)))

  const contractsNeedTdlibCheck = await fetchStubbornNotTelegram()
  while (contractsNeedTdlibCheck.length) {
    const contractNeedTdlibCheck = contractsNeedTdlibCheck.pop()
    const hasMatchingGroup = await searchTelegramGroup(contractNeedTdlibCheck.contract)
    if (hasMatchingGroup) {
      return await updateContract(contractNeedTdlibCheck.address, { telegram: contractNeedTdlibCheck.contract })
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const contractsPendingAlert = await fetchWithPendingAlert()
  await Promise.all(contractsPendingAlert.map(async (contract) => {
    await sendAlertForDetectedGroup(contract)
    return await updateContract(contract.address, { alertSent: true })
  }))

  console.log('Iteration end!')
  return true
}

cron.schedule('*/30 * * * *', () => {
  runIteration()
})
runIteration() // run once immediately