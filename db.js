const Datastore = require('nedb')
const db = new Datastore({
  filename: 'Tg.db',
  autoload: true
})
db.persistence.setAutocompactionInterval(5 * 1000)

const fetchStubbornNotTelegram = async () => {
  return new Promise((resolve, reject) => {
    db.find({
      telegramCheckedInSource: true,
      telegram: null
    }, (err, doc) => {
      if (err) {
        return reject(err)
      }
      return resolve(doc)
    })
  })
}

const fetchWithPendingAlert = async () => {
  return new Promise((resolve, reject) => {
    db.find({
      alertSent: false,
      telegram: {
        $ne: null
      }
    }, (err, doc) => {
      if (err) {
        return reject(err)
      }
      return resolve(doc)
    })
  })
}

const doesExist = (resultAddress) => {
  return new Promise((resolve, reject) => {
    db.findOne({
      address: resultAddress
    }, (err, doc) => {
      if (err) return reject(err)
      if (doc !== null && doc.address === resultAddress) {
        return resolve(true)
      }
      resolve(false)
    })
  })
}

const insertContract = (result) => {
  return new Promise((resolve, reject) => {
    db.insert({
      contract: result.contract,
      address: result.address,
      telegram: result.telegram,
      telegramCheckedInSource: true,
      alertSent: false
    },
    (err, newDoc) => {
      if (err) return reject(err)
      resolve(newDoc)
    })
  })
}

const updateContract = (address, newValues) => {
  return new Promise((resolve, reject) => {
    db.update({
      address
    }, {
      $set: { ...newValues }
    },
    (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

module.exports = {
  insertContract,
  updateContract,
  doesExist,
  fetchStubbornNotTelegram,
  fetchWithPendingAlert
}