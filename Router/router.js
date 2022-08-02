const {
    setDoc,
    getDoc,
    createDoc
} = require('../Database/functions')

const filesUpload = require('../Middleware/Upload/upload')
const ankiToJson = require('../ankitoJSON')
const Auth_Middleware = require('../Middleware/Firebase/Firebase_Auth')

const router = require('express').Router()

router.post('/convert', Auth_Middleware, filesUpload, async (req, res, next) => {
    req.user_doc = null
    uid = req.uid
    const doc_exesist = await getDoc(uid)

    if(!req.file){
        return res.status(400).send({error:true, messsage:"Please upload a anki file having extension .apkg"})
    }

    if (!doc_exesist) {
        next()
    } else if(!doc_exesist.premium){
        if (doc_exesist.uploads >= 5)
            return res.send({error:true, messsage:"Upload limit is 5 files/month for non premium users."})
        if (req.file.size >= 5000000)
            return res.send({error:true, messsage:"Upload size limit is 50MB for non premium users."})
    }

    req.user_doc = doc_exesist
    next()

}, async (req, res) => {
    try {
        
        const result = await ankiToJson(req.file.buffer)
        if (result == false)
            return res.send({error:true, messsage:'Falied to covert file.'})
        else {
            if(req.user_doc){
                const update = {
                    ...req.user_doc,
                    uploads: req.user_doc.uploads + 1
                }
                await setDoc(req.uid, update)
            } else {
                await createDoc({
                    premium: false,
                    uid,
                    uploads: 1,
                    id: uid
                })
            } 
            
            return res.send({error:false, data:result})
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            error: true,
            messsage: "Internal server error"
        })
    }
})

module.exports = router