const handleDisplay = require('./handleDisplay.js')
const fs = require('fs')

jest.mock('fs')

test('If readingList.json does not exist, return false', () => {
  fs.existsSync.mockResolvedValue(false)
  expect(handleDisplay.getReadingList()).toBe(false)
})

test('If readingList.json exists but is empty, return false', () => {
  fs.existsSync.getResolvedValue(true)
  fsp.readFile.mockImplementation(() => Promise.resolve([]))
  expect(handleDisplay.getReadingList()).toBe(false)
})