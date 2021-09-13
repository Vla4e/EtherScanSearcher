const scrapeContractAddresses = require('./scraper')
const { processContractAddresses } = require('./etherrer')
const { insertContract, updateContract, doesExist, fetchStubbornNotTelegram, fetchWithPendingAlert } = require('./db')
const { searchTelegramGroup, sendAlertForDetectedGroup } = require('./telegrammer')

const runIteration = async () => {
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
  await Promise.all(contractsNeedTdlibCheck.map(async (contract) => {
    const hasMatchingGroup = await searchTelegramGroup(contract.contract)
    if (hasMatchingGroup) {
      return await updateContract(contract.address, { telegram: contract.contract })
    }
    return Promise.resolve()
  }))

  const contractsPendingAlert = await fetchWithPendingAlert()
  await Promise.all(contractsPendingAlert.map(async (contract) => {
    await sendAlertForDetectedGroup(contract)
    return await updateContract(contract.address, { alertSent: true })
  }))

  console.log('Iteration done!')
  return true
}

runIteration()