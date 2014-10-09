/**
 * A middleware that sets a default `charset` in the `Content-Type` header, if
 * one hasn't already been set in a downstream app.
 */
function contentCharSet(app, defaultType) {
  defaultType = defaultType || 'utf-8';

  return function (request) {
    return request.call(app).then(function (response) {
      var headers = response.headers;

      if (!headers['Content-Type'])
        throw new Error("contentCharSet must be called after contentType");

      if (headers['Content-Type'].indexOf("charset") === -1)
        headers['Content-Type'] += "; charset=" + defaultType;

      return response;
    });
  };
}

module.exports = contentCharSet;
