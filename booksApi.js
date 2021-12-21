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

  // Used in main(), handleDisplay(), saveBookQ(), and (COMMENTED OUT -->)handleDelete()
  const getMenuResponse = async (num) => {
    // initialize input
    const rl = readline.createInterface({ input, output })
    // initialize answer variable for while loop
    let answer = ''
    // Repeat question until valid answer is inputted
    while (!(answer >= 1 && answer <= num)) {
      const rawAnswer = await rl.question('Your menu choice: ')
      // convert to int
      answer = parseInt(rawAnswer)
    }
    // Close input
    rl.close()
    return answer
  }
  // Used in handleSearch() and handleDisplay()
  const displayBooks = (books) => {
    // Display each book 1 by 1
    books.forEach((book, index) => {
      let authors = ''
      // If there is no author
      if (book.authors === undefined) {
        authors = 'author not available'
      // If there is <= 2 authors
      // 1 author: .join turns the array into a string with no separator
      // 2 authors: .join joins the two authors with the separator
      } else if (book.authors.length <= 2) {
        authors = book.authors.join(' and ')
      // If 3 or more separate all but the last with a comma, and separate the last two with ' and '
      } else if (book.authors.length > 2) {
        authors = book.authors.slice(0, -1).join(', ')+' and '+book.authors.slice(-1)
      }
      const titleAuthor = `${index + 1}: ${book.title} by ${authors}`
      console.log(titleAuthor)
      // If book publisher is NOT undefined then print publishing company
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
      // Get input
      const rawAnswer = await rl.question('Search for: ')
      // Close getting input
      rl.close()
      // Force lowercase to allow for less exact responses
      const answer = rawAnswer.toLowerCase()
      return answer
    }
    const getQueryFromGoogle = async (searchTerm) => {
      try {
        const apiKey = 'AIzaSyCq4Y-BpzY0KobPAy-7JvHnQRzjNgSiAUY'
        // maxResults=10 so that if any don't work there are backups to make sure there are at least 5 responses
        const url = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=10&key=${apiKey}`
        // Make the request
        const rawResp = await fetch(url)
        // Convert to JSON
        const resp = await rawResp.json()
        // Establish variable to add books into
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
    // saveBookQuestion - Do you want to save a book to your reading list?
    const saveBookQ = async (numBooks) => {
      // Display menu for saving a book or to go back
      console.log(`\nIf you want to select a book to save to your reading list, choose book from 1-${numBooks}.`)
      console.log(`To go back, choose ${numBooks + 1} `)
      // Get which book to save or cancel
      const bookAnswer = await getMenuResponse(numBooks + 1)
      // If user wants to go back
      if (bookAnswer === numBooks + 1) {return false}
      // Pass up selection
      return bookAnswer
    }
    const addToList = (response, selection) => {
      // correct selection for indexes starting at 0 vs book display starting at 1
      const bookToAdd = response[selection - 1]
      // If the file readingList.json exists then...
      if (fs.existsSync('readingList.json')) {
        // Read that file
        fs.readFile('readingList.json', (err, data) => {
          // Convert data in file to an array of javascript objects
          let jsObjs = JSON.parse(data)
          // Add bookToAdd to array
          jsObjs.push(bookToAdd)
          // convert jsonObj to JSON with newlines and indents
          const booksJSON = JSON.stringify(jsObjs, null, 2)
          // Overwrite readingList.json with entirely new contents consisting of added-to original contents
          fs.writeFile('readingList.json', booksJSON, (err) => {
            if (err) {
              console.log(err)
            }
          })
        })
      // If booShelf.json does not exist then create it starting with bookToAdd
      } else {
        // convert bookToAdd to JSON with newlines and indents
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
    // Get what the user wants to search for
    const query = await getSearchTermFromUser()
    // Find matching results from Google Books API
    const response = await getQueryFromGoogle(query)
    // If there are results
    if (response.length >= 1) {
      // Display them
      console.log('\nSearch Results:')
      displayBooks(response)
      // Ask if user wants to add any to shelf
      const selection = await saveBookQ(response.length)
      // If not, end function
      if (selection === false) {return}
      // If yes then add selection to shelf
      addToList(response, selection)
    } else {
      console.log('No results, try again')
    }
  }

  const handleDisplay = async () => {
    const getReadingList = async () => {
      // if file readingList.json exists
      if (fs.existsSync('readingList.json')) {
        // Special import needed specifically to get await to work. async/await does not work with typical fs import.
        const data = await fsp.readFile('readingList.json')
        const jsonObj = JSON.parse(data)
        // If readingList.json exists but is empty then return false
        if (jsonObj.length === 0) {return false}
        return jsonObj
      // If file readingList.json does not exist then return false
      } else {return false}
    }
    
    // // REMOVED BECAUSE "Please do not add any additional features."
    // // Called in handleDelete()
    // const deleteFromReadingList = (readinglist, choice) => {
    //   // Remove chosen book (corrected for index) from readinglist array
    //   readinglist.splice(choice - 1, 1)
    //   // convert to JSON
    //   const booksJSON = JSON.stringify(readinglist, null, 2)
    //   // Overwrite readingList.json with new readinglist contents
    //   fs.writeFile('readingList.json', booksJSON, (err) => {
    //     if (err) {
    //       console.log(err)
    //     }
    //   })
    // }
    // const handleDelete = async (readinglist) => {
    //   // Identify book to delete with options
    //   console.log('\nWhich book do you want to delete? (1-' + readinglist.length.toString() + ')')
    //   console.log((readinglist.length + 1).toString() + ' to cancel')
    //   // Retrieve user's input, with extra option for canceling deletion
    //   const choice = await getMenuResponse(readinglist.length + 1)
    //   // If user wants to cancel deletion
    //   if (choice == readinglist.length + 1) {return}
    //   // Actually delete the book from the readinglist.
    //   deleteFromReadingList(readinglist, choice)
    // }

    // *******HANDLE DISPLAY*******
    // Retrieve books in readingList.json
    let readinglist = await getReadingList()
    // If no books end function
    if (readinglist === false) {
      console.log('You do not have any books on your reading list')
      return
    }
    console.log('\nThe books on your reading list are: ')
    // Display the books
    displayBooks(readinglist)

    // // REMOVED BECAUSE "Please do not add any additional features."
    // console.log('\nWhat do you want to do? (1-2)')
    // console.log('1: Remove a book')
    // console.log('2: Go Back')
    // // Get user input
    // const choice = await getMenuResponse(2)
    // // If user selects '2: Go Back' end the function
    // if (choice == 2) {return}
    // // If user wants to delete a book then ask which book to delete
    // if (choice == 1) {await handleDelete(readinglist)}
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
      // Display intro and options
      displayMenu()
      // Get user input
      const choice = await getMenuResponse(3)
      // If 3, then exit app
      if (choice == 3) {break}
      // If 2, then search for books
      if (choice == 2) {await handleSearch()}
      // If 1, then display books in reading list
      if (choice == 1) {await handleDisplay()}
    }
  }
  // Start with main menu
  main()
}

// Initialize app
booksApi()

export default booksApi