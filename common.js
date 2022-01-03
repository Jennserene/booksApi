// To implement response input in console
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'process'

// Used in main(), and saveBookQuestion()
export const getMenuResponse = async (num) => {
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
export const displayBooks = (books) => {
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