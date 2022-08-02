const fs = require('fs')
const Zip = require('node-zip')
const sqlite3 = require('sqlite3')
const {
    v4: uuidv4
} = require('uuid')
const {
    parse
} = require('himalaya')


// ONE: Create temp files from zip
// TWO: go through media and move each numeric file, renamed
// THREE: Open the sql database, go through each note


const ankiToJson = (inputFile) => {
    try {
        return new Promise(async (resolve, reject) => {
            const final_json = {
                media: {},
                database: {},
                fields: {},
                card_data: {}
            }
    
            const fileds_name = []
    
            const output_file = await uuidv4()
    
            const zip = new Zip(inputFile, {
                base64: false,
                checkCRC32: true
            })
    
            let media = JSON.parse(zip.files['media']._data)
    
            for (let key in zip.files) {
                let file = zip.files[key]
                if (!isNaN(file.name)) {
                    final_json.media[media[file.name]] = {
                        encoding: 'binary',
                        data: file._data
                    }
                } else if (file.name === 'collection.anki2') {
                    fs.writeFileSync(__dirname + '\\outputs\\' + output_file, file._data, {
                        encoding: 'binary'
                    })
                }
            }
    
            const db = new sqlite3.Database(__dirname + '\\outputs\\' + output_file)
    
            db.all('SELECT * FROM col', (err, model_data) => {
                if (err) {
                    console.log('ERROR', err)
                    db.close()
                    delete db
    
                    setTimeout(() => {
                        fs.rmSync(__dirname + '\\outputs\\' + output_file)
                    }, 3000)
                    resolve(false)
                }
    
                const model = JSON.parse(model_data[0].models)
                const fields = model[Object.keys(model)[0]].flds
    
    
                for (let x = 0; x < fields.length; x++) {
                    fileds_name.push(fields[x].name)
                    final_json.fields[fields[x].name] = fields[x]
                }
    
                db.all('SELECT * FROM notes', (err, notes) => {
                    if (err) {
                        console.log('ERROR', err)
                        db.close()
                        delete db
    
                        setTimeout(() => {
                            fs.rmSync(__dirname + '\\outputs\\' + output_file)
                        }, 3000)
                        resolve(false)
                    }
    
                    for (let z = 0; z < notes.length; z++) {
                        const note = notes[z];
                        // feilds data is present in col.models => flds
                        // \u001f is breaker for these flds
                        note.media = []
    
                        const notes_fileds = note.flds.split('\u001f')
                        note.front = note.sfld.replaceAll('\t', '\n').replace(/\n+/g, '\n')
                        note.back = note.flds.replaceAll('\u001f', '\n').replace(/\n+/g, '\n')
                        let openBracketIndexes = []
                        let closedBracketIndexes = []
                        // FRONT
                        for (let i = 0; i < note.front.length; i++) {
                            if (note.front[i] === '[') {
                                openBracketIndexes.push(i)
                            }
                            if (note.front[i] === ']') {
                                closedBracketIndexes.push(i)
                            }
                        }
                        while (openBracketIndexes.length) {
                            let start = openBracketIndexes.shift()
                            let end = closedBracketIndexes.shift()
                            let bracketString = note.front.slice(start + 1, end)
                            if (bracketString.includes(':')) {
                                note.media.push(bracketString.split(':')[1])
                                note.front = note.front.slice(0, start) + note.front.slice(end + 1)
                            }
                        }
                        // BACK
                        for (let i = 0; i < note.back.length; i++) {
                            if (note.back[i] === '[') {
                                openBracketIndexes.push(i)
                            }
                            if (note.back[i] === ']') {
                                closedBracketIndexes.push(i)
                            }
                        }
                        while (openBracketIndexes.length) {
                            let start = openBracketIndexes.shift()
                            let end = closedBracketIndexes.shift()
                            let bracketString = note.back.slice(start + 1, end)
                            if (bracketString.includes(':')) {
                                note.media.push(bracketString.split(':')[1])
                                note.back = note.back.slice(0, start) + note.back.slice(end + 1)
                            }
                        }
                        // TODO: images, items, sentences
                        // LASTLY ensure no dublicates, remove access words, if the word does not exist, remove entry
                        // <img src=\"
                        // IMAGES
                        let images = indexesOf('<img', note.flds)
                        for (let q = 0; q < images.length; q++) {
                            const imageIndex = images[q];
                            let imageSrc = note.flds.slice(imageIndex + 10).split('"')
                            note.media.push(imageSrc[0])
                        }
    
                        note.media = [...new Set(note.media)]
                        note.front = note.front.trim()
                        note.back = note.back.trim()
    
                        //setting up fileds
    
                        note.flds = {}
                        for (let key = 0; key < fileds_name.length; key++) {
                            note.flds[fileds_name[key]] = parse(notes_fileds[key])
                        }
    
                        if (note.front)
                            note.front = parse(note.front)
                        if (note.back)
                            note.back = parse(note.back)
    
                        notes[z] = note
                    }
                    
                    final_json.card_data = notes
                    db.close()
                    delete db
                    
                    
                    setTimeout(() => {
                        fs.rmSync(__dirname + '\\outputs\\' + output_file)
                    }, 10000)
    
                    resolve(final_json)
                })
            })
        })
        
    } catch (error) {
        console.log(error)
        return false
    }
}

function indexesOf(searchStr, str, caseSensitive) {
    let searchStrLen = searchStr.length
    if (searchStrLen === 0) return []
    let startIndex = 0
    let index
    let indices = []
    if (!caseSensitive) {
        str = str.toLowerCase()
        searchStr = searchStr.toLowerCase()
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index)
        startIndex = index + searchStrLen
    }
    return indices
}

module.exports = ankiToJson