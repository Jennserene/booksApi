import handleDisplay, { getReadingList } from './handleDisplay.js'
import { displayBooks } from './common.js'

const mockExistsSync = jest.fn()
const mockReadFile = jest.fn()

jest.mock('fs', () => ({
  existsSync: () => mockExistsSync(),
  promises: {
    readFile: () => mockReadFile()
  }
}))

mockExistsSync.mockReturnValue(false).mockReturnValue(true)
mockReadFile.mockReturnValue("[]")

it('Should check for file not existing or being empty', async () => {
  expect(await getReadingList()).toBe(false)
  expect(await getReadingList()).toBe(false)
})

jest.mock('./common.js', () => ({
  displayBooks: jest.fn()
}))

describe('When calling handleDisplay', () => {
  describe('And getReadingList returns false', () => {
    let consoleSpy
    beforeEach(() => {
      mockExistsSync.mockReturnValue(false)
      consoleSpy = jest.spyOn(console, 'log')
      handleDisplay()
    })

    it('Should log something to the console and should not call displayBooks', () => {
      expect(consoleSpy).toHaveBeenCalledWith('You do not have any books on your reading list')
      expect(displayBooks).not.toHaveBeenCalled()
    })
  })

  describe('And getReadingList returns true', () => {
    let consoleSpy
    let exampleBook
    beforeEach(() => {
      exampleBook = [{
        "title": "Example Title",
        "authors": [
          "Example Author"
        ],
        "publisher": "Example Publisher"
      }]
      mockExistsSync.mockReturnValue(true)
      mockReadFile.mockReturnValue(JSON.stringify(exampleBook))
      consoleSpy = jest.spyOn(console, 'log')
      handleDisplay()
    })

    it('Should log something to the console and should call displayBooks', () => {
      expect(consoleSpy).toHaveBeenCalledWith('\nThe books on your reading list are: ')
      expect(displayBooks).toHaveBeenCalledWith(exampleBook)
    })
  })
})