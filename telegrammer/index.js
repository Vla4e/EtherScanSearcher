const { Client } = require('tdl')
const { TDLib } = require('tdl-tdlib-addon')

const API_ID = 8224639
const API_HASH = '979a9214b4df8e1e02a67c68fa952563'
const BOT_TOKEN = '1954690765:AAHqY3vFVSnvu_zhMHeMiky_a28kUnP4i80'
const CHAT_ID = 1196185249

const searchGroup = async (username) => {
  try {
    const tdUserClient = new Client(new TDLib(), {
      apiId: API_ID,
      apiHash: API_HASH,
      databaseDirectory: '_td_database/user',
      filesDirectory: '_td_files/user'
    })

    await tdUserClient.connect()
    await tdUserClient.login(() => ({
      type: 'user'
    }))

    console.log('Logged in user!')

    const tdBotClient = new Client(new TDLib(), {
      apiId: API_ID,
      apiHash: API_HASH,
      databaseDirectory: '_td_database/bot',
      filesDirectory: '_td_files/bot'
    })

    await tdBotClient.connect()
    await tdBotClient.login(() => ({
      type: 'bot',
      getToken: retry => retry ? Promise.reject('Bad token') : Promise.resolve(BOT_TOKEN)
    }))

    console.log('Logged in bot!')

    const searchChatResult = await tdUserClient.invoke({
      _: 'searchPublicChat',
      username
    })
    console.log('Found chat!', searchChatResult.title)

    const sendMessageResult = await tdBotClient.invoke({
      _: 'sendMessage',
      chat_id: CHAT_ID,
      input_message_content: {
        _: 'inputMessageText',
        text: {
          _: 'formattedText',
          text: `Heya! Found a corresponding Telegram group for an Ethereum contract: @${username}.`
        }
      }
    })
    console.log('Message sent!', sendMessageResult)
  } catch(e) {
    console.error('Error!', e)
  }
}
searchGroup('PartyADA')

// nvm install -s 12 --shared-openssl --shared-openssl-includes=/usr/local/opt/openssl@1.1/include
// \ s--shared-openssl-libpath=/usr/local/opt/openssl@1.1/lib