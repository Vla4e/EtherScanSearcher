const Datastore = require('nedb');
const { DownloadContent } = require('nodejs-web-scraper');
const db = new Datastore({ filename: 'Tg.db', autoload: true });

let removeAll = false; // if set to True -> deletes whole database when running "node db.js" in cmd.

async function fetchStubbornNotTelegram(){
    return new Promise((resolve, reject) => {
            db.find({
                telegramCheckedInSource: true,
                telegram: null
            }, (err, doc) => {
                if(err){
                    return reject(err)
                }
                return resolve(doc)
            })
        }
    )
}

function doesExist(resultAddress){
    return new Promise((resolve, reject) => {
        db.findOne({address: resultAddress}, function (err, doc){
                if (err) return reject(err)

                if(doc !== null && doc.address === resultAddress){
                    resolve(true)
                }
                resolve(false);
            })
        // try{
        //     let exist = false
        // }
        // catch(e){
        //     return reject(e)
        // }
    })
}

function insertContract(result){
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
        });
    })
}

function updateContract(address, contractName) {
    return new Promise((resolve, reject) => {
        db.update({ address }, { $set: { telegram: contractName } }, { multi: false },
        (err) => {
            if (err) return reject(err)
            resolve()
        });
    })
}

// function removeContract(){
//     db.remove({ _id: this.contractId}, {}, function (err, numRemoved) {
//         // numRemoved = 1
//       });
      
// }

if(removeAll){
    db.remove({}, { multi: true }, function (err, numRemoved) {
    });
}

module.exports = { insertContract, updateContract, doesExist, fetchStubbornNotTelegram }