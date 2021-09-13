const { Client } = require('tdl')
const { TDLib } = require('tdl-tdlib-addon')

const API_ID = 8224639
const API_HASH = '979a9214b4df8e1e02a67c68fa952563'
const BOT_TOKEN = '1954690765:AAHqY3vFVSnvu_zhMHeMiky_a28kUnP4i80'
const CHAT_ID = 1196185249

let tdUserClient = null
let tdBotClient = null

const initClients = async () => {
  tdUserClient = new Client(new TDLib(), {
    apiId: API_ID,
    apiHash: API_HASH,
    databaseDirectory: '_td_database/user',
    filesDirectory: '_td_files/user',
    verbosityLevel: 0
  })
  await tdUserClient.connectAndLogin(() => ({ type: 'user' }))
  console.log('Logged in user!')
  
  tdBotClient = new Client(new TDLib(), {
    apiId: API_ID,
    apiHash: API_HASH,
    databaseDirectory: '_td_database/bot',
    filesDirectory: '_td_files/bot',
    verbosityLevel: 0
  })
  await tdBotClient.connectAndLogin(() => ({
    type: 'bot', getToken: retry => retry ? Promise.reject('Bad token') : Promise.resolve(BOT_TOKEN)
  }))
  console.log('Logged in bot!')
  return true
}

const searchTelegramGroup = async ({ address, contract: username }) => {
  try {
    const searchChatResult = await tdUserClient.invoke({
      _: 'searchPublicChat',
      username
    })
    console.log('Found channel!', searchChatResult.title)

    const sendMessageResult = await tdBotClient.invoke({
      _: 'sendMessage',
      chat_id: CHAT_ID,
      input_message_content: {
        _: 'inputMessageText',
        text: {
          _: 'formattedText',
          text: `Heya! Found a corresponding Telegram group for an Ethereum contract at https://etherscan.io/contractsVerified/${address} : ${username}.`
        }
      }
    })
    console.log('Message sent!')
    return username
  } catch(e) {
    console.error('Error!', e)
    return null
  }
}

initClients()
  // .then(async () => {
  //   const result = await searchTelegramGroup({
  //     address: '0xea5b5f81d8ad4e5ffa426cdceab4164bb08dfd60',
  //     contract: '@PartyADA'
  //   })
  //   console.log(result, 0)
  // })

module.exports = searchTelegramGroup

// nvm install -s 12 --shared-openssl --shared-openssl-includes=/usr/local/opt/openssl@1.1/include
// \ s--shared-openssl-libpath=/usr/local/opt/openssl@1.1/lib