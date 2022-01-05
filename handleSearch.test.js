import { getSearchTermFromUser, getQueryFromGoogle } from './handleSearch.js'
import fetch from 'node-fetch'

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

describe('When calling getQueryFromGoogle', () => {
  describe('And getQueryFromGoogle returns a list of books', () => {
    let fetchReturn
    let expectedValue
    let returnedValue
    beforeEach(() => {
      fetchReturn = {items: [{
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
      expectedValue = [
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
      fetch.mockReturnValue({
        json: jest.fn().mockReturnValue(fetchReturn)
      })
      returnedValue = getQueryFromGoogle('test')
    })

    it('Should make a fetch request and return a formatted version of the result.', async () => {
      expect(fetch).toHaveBeenCalledWith('https://www.googleapis.com/books/v1/volumes?q=test&maxResults=10&key=AIzaSyCq4Y-BpzY0KobPAy-7JvHnQRzjNgSiAUY')
      expect(await returnedValue).toHaveLength(5)
      expect(await returnedValue).toStrictEqual(expectedValue)
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