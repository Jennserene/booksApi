import main, { displayMenu } from './main.js'
import handleDisplay from './handleDisplay.js'
import handleSearch from './handleSearch.js'

const mockMenuResponse = jest.fn()

jest.mock('node-fetch', () => jest.fn())
jest.mock('./common.js', () => ({
  getMenuResponse: () => mockMenuResponse()
}))
jest.mock('./handleDisplay.js', () => jest.fn())
jest.mock('./handleSearch.js', () => jest.fn())

it('Should check console.log for menu', () => {
  const consoleSpy = jest.spyOn(console, 'log')
  displayMenu()
  expect(consoleSpy).toHaveBeenCalledWith('\nWelcome to this book search app, powered by the Google Books API')
})

describe('In Main', () => {
  console.log = jest.fn()
  describe('When user enters 1', () => {
    beforeEach(async () => {
      mockMenuResponse.mockReturnValueOnce(1).mockReturnValueOnce(3)
      handleDisplay.mockReset()
      handleSearch.mockReset()
      await main()
    })

    it('Should call handleDisplay()', async () => {
      expect(handleDisplay).toHaveBeenCalled()
    })
  })
  describe('When user enters 2', () => {
    beforeEach(async () => {
      mockMenuResponse.mockReturnValueOnce(2).mockReturnValueOnce(3)
      handleDisplay.mockReset()
      handleSearch.mockReset()
      await main()
    })

    it('Should return that number', async () => {
      expect(handleSearch).toHaveBeenCalled()
    })
  })
  describe('When user enters 3', () => {
    let returnValue
    beforeEach(async () => {
      mockMenuResponse.mockReturnValue(3)
      handleDisplay.mockReset()
      handleSearch.mockReset()
      returnValue = await main()
    })

    it('Should call nothing', async () => {
      expect(handleDisplay).not.toHaveBeenCalled()
      expect(handleSearch).not.toHaveBeenCalled()
      expect(returnValue).toBe(undefined)
    })
  })
})