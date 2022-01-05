import { getSearchTermFromUser, getQueryFromGoogle, getBooks, saveBookQuestion, addToList } from './handleSearch.js'
import fetch from 'node-fetch'
import * as fs from 'fs'

const mockQuestion = jest.fn()

jest.mock('node:readline/promises', () => ({
  createInterface: jest.fn().mockReturnValue({
    question: () => mockQuestion(),
    close: jest.fn()
  })})
)
jest.mock('node-fetch', () => jest.fn())

mockQuestion
  .mockReturnValue("") // Bad input
  .mockReturnValue(" ") // Bad input
  .mockReturnValue("     ") // Bad input
  .mockReturnValue("  ") // Tab - Bad input
  .mockReturnValue("TeSt"), // Good input

it('Should check for bad inputs and good input in getSearchTermFromUser', async () => {
  expect(await getSearchTermFromUser()).toBe('test')
})

const rawBookFetchReturn = {items: [{
  volumeInfo: {
    title: "The Test",
    authors: "Sylvain Neuvel",
    publisher: "Tor.com"
  }},
  {volumeInfo: {
    title: "The Test Book",
    authors: "Mikael Krogerus,Roman Tschäppeler",
    publisher: "W. W. Norton & Company"
  }},
  {volumeInfo: {
    title: "The Mom Test",
    authors: "Rob Fitzpatrick",
    publisher: "Robfitz Ltd"
  }},
  {volumeInfo: {
    title: "Test This Book!",
    authors: "Louie Zong",
    publisher: "Imprint"
  }},
  {volumeInfo: {
    title: "The Official Guide to the GRE General Test, Third Edition",
    authors: "Educational Testing Service",
    publisher: "McGraw-Hill Education"
  }},
  {volumeInfo: {
    title: "The Decision Book",
    authors: "Mikael Krogerus,Roman Tschäppeler",
    publisher: "Profile Books"
  }},
  {volumeInfo: {
    title: "This Is Not a Test",
    authors: "Courtney Summers",
    publisher: "Macmillan"
  }},
  {volumeInfo: {
    title: "The Marshmallow Test",
    authors: "Walter Mischel",
    publisher: "Little, Brown Spark"
  }},
  {volumeInfo: {
    title: "Testing Treatments",
    authors: "Imogen Evans,Hazel Thornton,Iain Chalmers,Paul Glasziou",
    publisher: "Pinter & Martin Publishers"
  }},
  {volumeInfo: {
    title: "Test of the Twins",
    authors: "Margaret Weis,Tracy Hickman,Michael Williams",
    publisher: "undefined"
  }}]}
const booksExpectedValue = [
    {
      title: 'The Test',
      authors: 'Sylvain Neuvel',
      publisher: 'Tor.com'
    },
    {
      title: 'The Test Book',
      authors: 'Mikael Krogerus,Roman Tschäppeler',
      publisher: 'W. W. Norton & Company'
    },
    {
      title: 'The Mom Test',
      authors: 'Rob Fitzpatrick',
      publisher: 'Robfitz Ltd'
    },
    {
      title: 'Test This Book!',
      authors: 'Louie Zong',
      publisher: 'Imprint'
    },
    {
      title: 'The Official Guide to the GRE General Test, Third Edition',
      authors: 'Educational Testing Service',
      publisher: 'McGraw-Hill Education'
    }
  ]

it('Should reformat raw books into readable objects', () => {
  expect(getBooks(rawBookFetchReturn)).toStrictEqual(booksExpectedValue)
})

describe('When calling getQueryFromGoogle', () => {
  describe('And getQueryFromGoogle returns a list of books', () => {
    let returnedValue
    beforeEach(() => {
      fetch.mockReturnValue({
        json: jest.fn().mockReturnValue(rawBookFetchReturn)
      })
      returnedValue = getQueryFromGoogle('test')
    })

    it('Should make a fetch request and return a formatted version of the result.', async () => {
      expect(fetch).toHaveBeenCalledWith('https://www.googleapis.com/books/v1/volumes?q=test&maxResults=10&key=AIzaSyCq4Y-BpzY0KobPAy-7JvHnQRzjNgSiAUY')
      expect(await returnedValue).toHaveLength(5)
      expect(await returnedValue).toStrictEqual(booksExpectedValue)
    })
  })
  describe('And getQueryFromGoogle console logs an error', () => {
    let consoleSpy
    beforeEach(() => {
      fetch.mockImplementation(() => {throw 'ruh-roh!'})
      consoleSpy = jest.spyOn(console, 'log')
      getQueryFromGoogle('test')
    })

    it('Should log the error', () => {
      expect(consoleSpy).toHaveBeenCalledWith('ruh-roh!')
    })
  })
})

const mockMenuResponse = jest.fn()
jest.mock('./common.js', () => ({
  getMenuResponse: () => mockMenuResponse()
}))

describe('In saveBookQuestion', () => {
  describe('When user enters numBooks + 1', () => {
    beforeEach(() => mockMenuResponse.mockReturnValue(6))

    it('Should return false', async () => {
      expect(await saveBookQuestion(5)).toBe(false)
    })
  })
  describe('When user enters a valid number below numBooks', () => {
    beforeEach(() => mockMenuResponse.mockReturnValue(2))

    it('Should return that number', async () => {
      expect(await saveBookQuestion(5)).toBe(2)
    })
  })
})

const mockExistsSync = jest.fn()
const mockReadFile = jest.fn()
const mockWriteFile = jest.fn()

jest.mock('fs', () => ({
  existsSync: () => mockExistsSync(),
  readFile: (a, b) => mockReadFile(a, b),
  writeFile: (a, b) => mockWriteFile(a, b)
}))

describe('In addToList', () => {
  describe('When file does not exist', () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(false)
      addToList(booksExpectedValue, 1)
    })
    it('Should call writeFile with selected book', () => {
      expect(mockWriteFile).toHaveBeenCalled()
    })
  })
  describe('When file exists', () => {
    let bookJSON
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true)
      mockReadFile.mockImplementation((filename, fn) => fn(false, "[]"))
      bookJSON = JSON.stringify([booksExpectedValue[0]], null, 2)
      mockWriteFile.mockReset()
      addToList(booksExpectedValue, 1)
    })
    it('Should call writeFile with selected book and response from readFile', () => {
      expect(mockWriteFile).toHaveBeenCalledWith("readingList.json", bookJSON)
    })
  })
})