import axios from 'axios'
import * as actionsCore from '@actions/core'

export async function checkURLWithRetry(
  url,
  requestMethod,
  retries,
  retryDelay,
  followRedirect,
  cookie,
  basicAuthString,
  searchString,
  searchNotString,
  useExponentialBackoff,
  debug
) {
  const core = debug ? console : actionsCore
  let retryCount = 0
  let cumulativeDelay = 0
  let config = {
    maxRedirects: followRedirect ? 30 : 0, // set a max to avoid infinite redirects, but that's arbitrary.
    headers: {},
    // Never throw on failure. Keep retrying as long as we still have retries left.
    validateStatus: () => true,
    // Don't parse the response if it's JSON etc. Always return as a string.
    transformResponse: (r) => r
  }

  if (basicAuthString) {
    const base64Credentials = Buffer.from(basicAuthString).toString('base64')
    config.headers.Authorization = `Basic ${base64Credentials}`
  }

  if (cookie) {
    config.withCredentials = true
    config.headers.Cookie = cookie
  }

  async function makeRequest() {
    try {
      const response = await axios({
        method: requestMethod,
        url,
        ...config
      })

      if (response?.status?.toString()?.match(/^[245]\d{2}$/)) {
        let passing = true
        const hasCORSHeader = response.headers?.['access-control-allow-origin'] === '*'

        // status code
        core.info(`Target ${url} returned a status code: ${response.status}.`)

        if (passing && searchString) {
          if (!(typeof response.data === 'string' && response.data.includes(searchString))) {
            core.error(`Target ${url} did not contain the desired string "${searchString}".`)
            passing = false
          }

          core.info(`Target ${url} did contain the desired string "${searchString}".`)
        }

        if (passing && searchNotString) {
          if (response.data.includes(searchNotString)) {
            core.error(`Target ${url} did contain the undesired string "${searchNotString}".`)
            passing = false
          }

          core.info(`Target ${url} did not contain the undesired string "${searchNotString}".`)
        }

        if (passing && !hasCORSHeader) {
          // check CORS
          core.error(`Target ${url} does not have CORS enabled.`)
          passing = false
        }

        if (passing) {
          core.info(
            `Target ${url} has CORS enabled after ${retryCount + 1} tries (${retryCount} retries), waited ${cumulativeDelay}ms in total.`
          )
          return true
        }
      }
    } catch (err) {
      core.info(err)
    }

    if (retryCount < retries) {
      retryCount++
      const delay = Math.pow(useExponentialBackoff ? 2 : 1, retryCount) * retryDelay
      cumulativeDelay += delay
      core.info(`Retrying in ${delay} ms... (Attempt ${retryCount}/${retries})`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return makeRequest()
    }

    throw new Error(`Max retries reached.`)
  }

  return makeRequest()
}
