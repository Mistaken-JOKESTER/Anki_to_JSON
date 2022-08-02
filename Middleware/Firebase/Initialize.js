const admin = require('firebase-admin')
const { FIREBASE_SERVICE_ACCOUNT } = require("./config");

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT)
})

module.exports = {admin}