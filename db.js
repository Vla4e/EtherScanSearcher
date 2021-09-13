const Datastore = require('nedb');
const { DownloadContent } = require('nodejs-web-scraper');
const db = new Datastore({ filename: 'Tg.db', autoload: true });

let removeAll = false; // if set to True -> deletes whole database when running "node db.js" in cmd.

async function fetchUncheckedAddresses(){
    return new Promise((resolve, reject) => {
            const UncheckedAddresses = []
            db.find({telegramChecked: false}, (err, doc) => {
                
                if(err){
                    return reject(err)
                }

                doc.forEach(element => {  
                    UncheckedAddresses.push(element.address)
                    //return UncheckedAddresses
                });
                return resolve(UncheckedAddresses)
            })
        }
    )
}

function doesExist(resultAddress){
    return new Promise((resolve, reject) => {
        try{
            let exist = false
            db.findOne({address: resultAddress}, function (err, doc){
                //console.log(doc)
                    if(doc !== null && doc.address === resultAddress){
                        exist = true;
                    }
                    return resolve(exist);
                })
        }
        catch(e){
            return reject(e)
        }
    })
}

function insertContract(result){
    db.insert({
        contract: result.contract, 
        address: result.address,
        telegram: result.telegram,
        telegramChecked: false, 
        alertSent: false,}, 
    function (err, newDoc) {
    
    });
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

module.exports = { insertContract, doesExist, fetchUncheckedAddresses }