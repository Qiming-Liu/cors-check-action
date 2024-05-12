import duration from 'duration-js'
import { checkURLWithRetry } from './check.js'

const urlString = 'https://cypress.io'
const requestMethod = 'GET'
const expectFailure = false
const maxAttemptsString = '3'
const retryDelayString = '6s'
const followRedirect = true
const cookie = ''
const basicAuthString = ''
const searchString = ''
const searchNotString = ''
const useExponentialBackoff = false

async function run() {
  const urls = urlString.split('|')
  const retryDelayMs = duration.parse(retryDelayString).milliseconds()
  const maxAttempts = parseInt(maxAttemptsString) - 1

  for (const url of urls) {
    // We don't need to do it in parallel, we're going to have to
    // wait for all of them anyway
    await checkURLWithRetry(
      url,
      requestMethod,
      maxAttempts,
      retryDelayMs,
      followRedirect,
      cookie,
      basicAuthString,
      searchString,
      searchNotString,
      useExponentialBackoff
    )
  }

  // If we reach this without running into an error
  console.info('All URL CORS checks succeeded.')
}

run().catch((e) => {
  if (expectFailure) {
    console.info('The check failed as expected.')
  } else {
    console.setFailed(e)
  }
})
