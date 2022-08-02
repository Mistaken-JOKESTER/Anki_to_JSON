const db = require("./initilaize")

const resetalldocs = () => {
    const collection = await db
          .collection(process.env.COLLECTION_NAME)
          .get()
        collection.forEach(doc=> {
          doc.ref
            .update({
                uploads: 0
            })
        })
}

const getDoc = (doc_id) => {
    return new Promise(async (resolve, reject) => {
        const limitRef = db.collection(process.env.COLLECTION_NAME).doc(doc_id);
        const doc = await limitRef.get();
        if (!doc.exists) {
            resolve(false)
        } else {
            resolve( doc.data());
        }
    }) 
}

const setDoc = (doc_id, data) => {
    return new Promise(async (resolve, reject) => {
        try{
            const doc = db.collection(process.env.COLLECTION_NAME).doc(doc_id);
            await doc.set(data)
            resolve(true)
        } catch(error){
            console.log(error)
            resolve(false)
        }
    }) 
}

const createDoc = (data) => {
    return new Promise(async (resolve, reject) => {
        try{
            const doc = db.collection(process.env.COLLECTION_NAME).doc(data.uid);
            await doc.set(data)
            resolve(true)
        } catch(error){
            console.log(error)
            resolve(false)
        }
    }) 
}

module.exports = {getDoc, setDoc, createDoc, resetalldocs}