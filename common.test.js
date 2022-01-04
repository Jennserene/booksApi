import { getMenuResponse, getAuthors, displayBooks } from './common.js'


it('Should check return values of various author types', () => {
  expect(getAuthors(undefined)).toBe('author not available')
  expect(getAuthors(['person'])).toBe('person')
  expect(getAuthors(['person1', 'person2'])).toBe('person1 and person2')
  expect(getAuthors(['person1', 'person2', 'person3'])).toBe('person1, person2, and person3')
})

it('Should check console.log for author/title', () => {
  const book = [{
    authors: ['person'],
    title: 'Book Title',
    publisher: undefined
  }]
  const consoleSpy = jest.spyOn(console, 'log')
  displayBooks(book)
  expect(consoleSpy).toHaveBeenCalledWith('1: Book Title by person')
})

jest.mock('node:readline/promises', () => ({
  createInterface: jest.fn().mockReturnValue({
    question: jest.fn()
      .mockReturnValue("blah") // Bad input
      .mockReturnValue(undefined) // Out of bounds input
      .mockReturnValue("0") // Bad input
      .mockReturnValue("99") // Bad input
      .mockReturnValue("2"), // Good input
    close: jest.fn()
  })
}))

it('Should check for bad inputs, out of bounds inputs, and good input in getMenuResponse', async () => {
  expect(await getMenuResponse(6)).toBe(2)
})