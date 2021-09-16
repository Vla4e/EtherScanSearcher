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
      await updateContract(contractNeedTdlibCheck.address, { telegram: contractNeedTdlibCheck.contract })
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const contractsPendingAlert = await fetchWithPendingAlert()
  while (contractsPendingAlert.length) {
    const contractPendingAlert = contractsPendingAlert.pop()
    await sendAlertForDetectedGroup(contractPendingAlert)
    await updateContract(contractPendingAlert.address, { alertSent: true })
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('Iteration end!')
  return true
}

const interval = 30 // insert whole amount of minutes
cron.schedule(`*/${interval} * * * *`, () => {
  runIteration()
})
runIteration() // run once immediately