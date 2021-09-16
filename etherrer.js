const request = require('request')

const API_KEY = 'A7WXDT7EXCIN1UM79EIK3F1ZQZ7BX53XPQ'

const getContractModule = (address, action) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.etherscan.io/api?module=contract&action=${action}&address=${address}&apikey=${API_KEY}`
    request(url, (err, _, body) => {
      if (err) return reject(err)
      try {
        const jsonBody = JSON.parse(body)
        const { result } = jsonBody
        resolve(Array.isArray(result) ? result[0] : result)
      } catch(e) {
        resolve(null)
      }
    })
  })
}

const getTelegramFromSourceCode = (sourceCode, address) => {
  try {
    const lines = []
    Object.values(sourceCode).forEach(({ content: fileSourceCode }) => {
      const fileLines = fileSourceCode.split('\n')
      lines.push(...fileLines)
    })
    const telegramLine = lines.find(line => line.includes('t.me'))
    if (telegramLine) {
      const telegramUsername = telegramLine.trim().split('t.me')[1].replace(/[^\w _]+/g, '').trim()
      return telegramUsername
    }
    return null
  } catch(e) {
    return null
  }
}

const processContractAddress = async (address) => {
  const contract = await getContractModule(address, 'getsourcecode')
  if (!contract) return null
  const { SourceCode, ContractName: contractName } = contract
  let sourceCode = ''
  try {
    sourceCode = JSON.parse(SourceCode)
  } catch(e) {
    sourceCode = {
      theonlyfile: {
        content: SourceCode
      }
    }
  }
  const telegram = getTelegramFromSourceCode(sourceCode, address)
  const result = { contract: contractName, address, telegram }
  console.debug(result)
  return result
}

const processContractAddresses = async (addresses) => {
  const results = []
  while (addresses.length) {
    const address = addresses.pop()
    const result = await processContractAddress(address)
    results.push(result)
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return results
}

module.exports = { processContractAddresses, processContractAddress}