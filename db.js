const Datastore = require('nedb');
const { DownloadContent } = require('nodejs-web-scraper');
const db = new Datastore({ filename: 'Tg.db', autoload: true });

let removeAll = false; // True = se brishi cela databaza pri "node db.js"

let TgContracts = {
    contract: '',
    address: '',
    telegram: null,
    telegramChecked: false,
    alertSent: false
}

function doesExist(resultAddress){
    return new Promise((resolve, reject) => {
        try{
            let exist = false
            db.findOne({address: resultAddress}, function (err, doc){
                console.log(doc)
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
    // console.log(insCont)
    // db.find({ contract: insCont.contract}, function (err, insCont) {
    //     try{
    //         if(insCont._id){
    //             console.log(insCont._id)
    //             let exists = true;
    //             console.log(exists);
    //         } else {
    //             console.log(err)
    //             console.log(insCont)
    //             db.insert({
    //                 contract: insCont.contract, 
    //                 address: insCont.address,
    //                 telegram: insCont.telegram,
    //                 telegramChecked: false, 
    //                 alertSent: false,}, 
    //             function (err, newDoc) {
                
    //             });
    //         }
    //     }
    //     catch(e){
    //         console.error(e);
    //     }
    //   });

}

function removeContract(){
    db.remove({ _id: this.contractId}, {}, function (err, numRemoved) {
        // numRemoved = 1
      });
      
}

if(removeAll){
    db.remove({}, { multi: true }, function (err, numRemoved) {
    });
}

module.exports = { insertContract, doesExist }