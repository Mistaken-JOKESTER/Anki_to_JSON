const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const db = getFirestore();

module.exports = db