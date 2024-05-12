# CORS check action

A quick & easy way to verify a if urls will work with CORS. 
> Check if http response headers contain `Access-Control-Allow-Origin: *`

### Simple usage
```yaml
steps:
  - name: Check if urls will work with CORS
    uses: Qiming-Liu/cors-check-action@v4
    with:
      url: https://cypress.io
```

### Full example
```yaml
steps:
  - name: Check if urls will work with CORS
    uses: Qiming-Liu/cors-check-action@v4
    with:
      # Check the following URLs one by one sequentially
      url: https://cypress.io
      # Optional, defaults to "GET"
      method: GET
      # Expect the check to fail (e.g. 4XX, 5XX status code)
      expect-failure: false
      # Follow redirects, or just report success on 3xx status codes
      follow-redirect: false # Optional, defaults to "false"
      # Fail this action after this many failed attempts
      max-attempts: 3 # Optional, defaults to 1
      # Delay between retries in s or ms
      retry-delay: 5s # Optional, only applicable to max-attempts > 1
      # Retry all errors, including 404. This option might trigger curl upgrade.
      retry-all: false # Optional, defaults to "false"
      # String representation of cookie attached to health check request.
      # Format: `Name=Value`
      cookie: "token=asdf1234" # Optional, default is empty
      # Basic auth login password pair.
      # Format: `login:password`
      basic-auth: "login:password" # Optional, default is empty
      # Search for the presence/absence of string in the page
      contains: "ready" # Optional, default is empty
      contains-not: "error" # Optional, default is empty
      # Whether to retry with exponential backoff (true) or linear delay
      exponential-backoff: true
```
