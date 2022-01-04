// To CRUD from a json file
import * as fs from 'fs'
// promises needed for async/await to work
import { promises as fsp } from "fs"

import { displayBooks } from './common.js'

export const getReadingList = async () => {
  if (fs.existsSync('readingList.json')) {
    // Special import needed specifically to get await to work. async/await does not work with typical fs import.
    const data = await fsp.readFile('readingList.json')
    const jsonObj = JSON.parse(data)
    if (jsonObj.length === 0) {return false}
    return jsonObj
  } else {return false}
}

const handleDisplay = async () => {
  let readinglist = await getReadingList()
  if (readinglist === false) {
    console.log('You do not have any books on your reading list')
    return
  }
  console.log('\nThe books on your reading list are: ')
  displayBooks(readinglist)
}

export default handleDisplay