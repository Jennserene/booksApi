import { getMenuResponse } from './common.js'
import handleSearch from './handleSearch.js'
import handleDisplay from './handleDisplay.js'

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

export default main