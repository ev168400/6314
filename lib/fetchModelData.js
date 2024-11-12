/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
async function fetchModel(url) {
  const response = await fetch(url);
  if (response.ok) {
    const json = await response.json();
    return { data: json };
  } else {
    return Promise.reject(new Error(JSON.stringify({status: response.status, statusText: response.statusText})));
  }
}

export default fetchModel;
