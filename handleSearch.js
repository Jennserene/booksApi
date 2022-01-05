// To implement response input in console
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'process'

// To fetch data from API
import fetch from 'node-fetch'

// To CRUD from a json file
import * as fs from 'fs'

import { displayBooks, getMenuResponse } from './common.js'

export const getSearchTermFromUser = async () => {
  // Initialize recieving input
  const rl = readline.createInterface({ input, output })
  console.log('\nSearching the Google Books API:')
  let rawAnswer = await rl.question('Search for: ')
  // If/While rawAnswer is only whitespace, ask again
  while (!rawAnswer.replace(/\s/g, '').length) {
    rawAnswer = await rl.question('Search for: ')
  }
  rl.close()
  const answer = rawAnswer.toLowerCase()
  return answer
}

export const getBooks = (resp) => {
  const allBooks = []
  resp.items.forEach((book) => {
    // Some books don't have a volumeInfo.title, where is their title?! It has to exist somewhere
    // Check if title exists then add
    if ('title' in book.volumeInfo) {
      allBooks.push({
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        publisher: book.volumeInfo.publisher,
      })
    }
  })
  // Get the first 5 books to meet requirement that only 5 books be displayed
  const books = allBooks.slice(0, 5)
  return books
}

export const getQueryFromGoogle = async (searchTerm) => {
  try {
    const apiKey = 'AIzaSyCq4Y-BpzY0KobPAy-7JvHnQRzjNgSiAUY'
    // maxResults=10 so that if any don't work there are backups to make sure there are at least 5 responses
    const url = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=10&key=${apiKey}`
    const rawResp = await fetch(url)
    const resp = await rawResp.json()
    const books = getBooks(resp)
    return books
  } catch (err) {
    console.log(err)
  }
}

export const saveBookQuestion = async (numBooks) => {
  console.log(`\nIf you want to select a book to save to your reading list, choose book from 1-${numBooks}.`)
  console.log(`To go back, choose ${numBooks + 1} `)
  const bookAnswer = await getMenuResponse(numBooks + 1)
  console.log(bookAnswer)
  console.log(numBooks)
  // If user wants to go back
  if (bookAnswer === numBooks + 1) {console.log('bookAnswer == numBooks + 1');return false}
  return bookAnswer
}

export const addToList = (response, selection) => {
  const bookToAdd = response[selection - 1]
  if (fs.existsSync('readingList.json')) {
    fs.readFile('readingList.json', (err, data) => {
      let jsObjs = JSON.parse(data)
      jsObjs.push(bookToAdd)
      // convert jsObjs to JSON with newlines and indents
      const booksJSON = JSON.stringify(jsObjs, null, 2)
      // Overwrite readingList.json with entirely new contents consisting of added-to original contents
      fs.writeFile('readingList.json', booksJSON, (err) => {
        if (err) {
          console.log(err)
        }
      })
    })
  } else {
    const bookJSON = JSON.stringify([bookToAdd], null, 2)
    fs.writeFile('readingList.json', bookJSON, (err) => {
      if (err) {
        console.log(err)
      }
    })
  }
  console.log('The book has been added!')
}

const handleSearch = async () => {
  const query = await getSearchTermFromUser()
  const response = await getQueryFromGoogle(query)
  if (response.length >= 1) {
    console.log('\nSearch Results:')
    displayBooks(response)
    const selection = await saveBookQuestion(response.length)
    // false == cancel save book
    if (selection === false) {return}
    addToList(response, selection)
  } else {
    console.log('No results, try again')
  }
}

export default handleSearch