const {
    admin
} = require("./Initialize")


const Auth_Middleware = (req, res, next) => {
    if(!req.header('Authorization')){
        return res.status(401).send({message:["Empty Token"], error:true})
    }

    const token = req.header('Authorization').replace('Bearer', '').trim()
    
    if(!token || token == ''){
        return res.status(403).send({message:["Invalid Token"], error:true})
    }

    
    admin.auth().verifyIdToken(token)
        .then(async (decodedToken) => {
            if (decodedToken.uid) {
                req.user = decodedToken.uid
                return next()
            }else{
                return res.status(403).send({message:["Invalid Token"], error:true})
            }
        }).catch(function (error) {
            //console.log("Firebase token error.")
            return res.status(403).send({message:["Invalid Token"], error:true})
        })
}

module.exports = Auth_Middleware
