// To implement response input in console
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'process'

// To fetch data from API
import fetch from 'node-fetch'

// To CRUD from a json file
import * as fs from 'fs'
// promises needed for async/await to work
import { promises as fsp } from "fs"

const booksApi = () => {

  // Used in main(), handleDisplay(), and saveBookQuestion()
  const getMenuResponse = async (num) => {
    // initialize input
    const rl = readline.createInterface({ input, output })
    let answer = ''
    // Repeat question until valid answer is inputted
    while (!(answer >= 1 && answer <= num)) {
      const rawAnswer = await rl.question('Your menu choice: ')
      answer = parseInt(rawAnswer)
    }
    rl.close()
    return answer
  }
  // Used in handleSearch() and handleDisplay()
  const displayBooks = (books) => {
    books.forEach((book, index) => {
      let authors = ''
      if (book.authors === undefined) {
        authors = 'author not available'
      } else if (book.authors.length <= 2) {
        authors = book.authors.join(' and ')
      } else if (book.authors.length > 2) {
        authors = book.authors.slice(0, -1).join(', ')+' and '+book.authors.slice(-1)
      }
      const titleAuthor = `${index + 1}: ${book.title} by ${authors}`
      console.log(titleAuthor)
      if (!(book.publisher === undefined)) {
        const publisher = `   Publishing Company: ${book.publisher}`
        console.log(publisher)
      }
    })
  }

  const handleSearch = async () => {
    const getSearchTermFromUser = async () => {
      // Initialize recieving input
      const rl = readline.createInterface({ input, output })
      console.log('\nSearching the Google Books API:')
      const rawAnswer = await rl.question('Search for: ')
      rl.close()
      const answer = rawAnswer.toLowerCase()
      return answer
    }
    const getQueryFromGoogle = async (searchTerm) => {
      try {
        const apiKey = 'AIzaSyCq4Y-BpzY0KobPAy-7JvHnQRzjNgSiAUY'
        // maxResults=10 so that if any don't work there are backups to make sure there are at least 5 responses
        const url = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=10&key=${apiKey}`
        const rawResp = await fetch(url)
        const resp = await rawResp.json()
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
      } catch (err) {
        console.log(err)
      }
    }
    const saveBookQuestion = async (numBooks) => {
      console.log(`\nIf you want to select a book to save to your reading list, choose book from 1-${numBooks}.`)
      console.log(`To go back, choose ${numBooks + 1} `)
      const bookAnswer = await getMenuResponse(numBooks + 1)
      // If user wants to go back
      if (bookAnswer === numBooks + 1) {return false}
      return bookAnswer
    }
    const addToList = (response, selection) => {
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

    // *******HANDLE SEARCH*******
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

  const handleDisplay = async () => {
    const getReadingList = async () => {
      if (fs.existsSync('readingList.json')) {
        // Special import needed specifically to get await to work. async/await does not work with typical fs import.
        const data = await fsp.readFile('readingList.json')
        const jsonObj = JSON.parse(data)
        if (jsonObj.length === 0) {return false}
        return jsonObj
      } else {return false}
    }

    // *******HANDLE DISPLAY*******
    let readinglist = await getReadingList()
    if (readinglist === false) {
      console.log('You do not have any books on your reading list')
      return
    }
    console.log('\nThe books on your reading list are: ')
    displayBooks(readinglist)
  }

  const main = async () => {
    const displayMenu = () => {
      console.log('\nWelcome to this book search app, powered by the Google Books API')
      console.log('Please choose an option (1-3):')
      console.log('1: Look at your reading list')
      console.log('2: Search for books')
      console.log('3: Close app')
    }

    while (true) {
      displayMenu()
      const choice = await getMenuResponse(3)
      if (choice == 3) {break}
      if (choice == 2) {await handleSearch()}
      if (choice == 1) {await handleDisplay()}
    }
  }
  main()
}

booksApi()

export default booksApi