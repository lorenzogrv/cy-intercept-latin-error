const { cy, describe, it, beforeEach, expect } = global

const URL = 'https://example.com/test'

function request (body) {
  /* global XMLHttpRequest */
  cy.window().then(() => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', URL)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(body))
  })
}

function dryAssert (interception) {
  const { request: req } = interception
  expect(req.body).to.not.be.an('ArrayBuffer')
  expect(req.body).to.be.an('object')
}

describe('cy.intercept latin tilde ArrayBuffer issue', () => {
  beforeEach(() => {
    cy.intercept(URL, { body: { result: 'ok' } }).as('interception')
  })

  describe('Cases working as of 8.1.0', () => {
    it('should work single "letter with tilde"', () => {
      request({ key: 'á' })
      cy.wait('@interception').then(dryAssert)
    })
    it('should work with five "letters with tilde"', () => {
      request({ key: 'áéíóú' })
      cy.wait('@interception').then(dryAssert)
    })
    it('should work with six "letters with tilde"', () => {
      request({ key: 'áéíóúá' })
      cy.wait('@interception').then(dryAssert)
    })
    it('should work with ten "letters with tilde"', () => {
      request({ key: 'áéíóúáéíóú' })
      cy.wait('@interception').then(dryAssert)
    })
    it('should work with fiveteen "letters with tilde"', () => {
      request({ key: 'áéíóúáéíóúáéíóú' })
      cy.wait('@interception').then(dryAssert)
    })

    it('should work with letters with tilde" within key', () => {
      request({ 'tíldéd Kéy': null })
      cy.wait('@interception').then(dryAssert)
    })
  })

  describe('Cases not working as of 8.1.0', () => {
    it('should work with mixed tilded and non-tilted letters', () => {
      request({ key: 'válúéwíthsómánytíldés' })
      cy.wait('@interception').then(dryAssert)
    })

    it('should work with letters with tilde" within key and value', () => {
      request({ 'tíldéd Kéy': 'áéíóúáéíóúáéíóú' })
      cy.wait('@interception').then(dryAssert)
    })
  })
})
