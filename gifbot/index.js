const requestp = require('./requestAsPromise');

const searchGifs = searchTerm =>
  requestp({
    url: 'http://api.giphy.com/v1/gifs/search',
    json: true,
    qs: {
      q: searchTerm,
      api_key: 'dc6zaTOxFJmzC',
    },
  });

const addComment = (url, body, token) =>
  requestp({
    json: true,
    headers: {
      Authorization: 'token ' + token,
      'User-Agent': 'ColinEberhardt',
      Accept: 'application/vnd.github.machine-man-preview+json',
    },
    method: 'POST',
    url,
    body: {
      body,
    },
  });

const regex = /\[gifbot:(.*?)\]/g;

const accessToken = process.env.GITHUB_ACCESS_TOKEN;

exports.handler = ({ body }, lambdaContext, callback) => {
  // 1. Check whether this is an action that adds a comment
  if (body.action !== 'created') {
    callback(null, { message: 'ignored action of type ' + body.action });
    return;
  }

  // 2. See whether any '[gifbot:search]' text appears in the comment
  const matches = regex.exec(webhook.comment.body);
  if (!matches) {
    callback(null, `The comment didn't summon the almighty gifbot`);
    return;
  }

  const searchTerm = matches[1];

  // 3. Search Giphy
  searchGifs(searchTerm)
    .then(results => {
      // 4. Get the first match and add a comment
      const gifUrl = results.data[0].images.fixed_height.url;
      comment = `![animated gif of ${searchTerm}](${gifUrl})`;
      return addComment(body.issue.comments_url, comment, accessToken);
    })
    .then(() => callback(null, 'added comment'))
    .catch(err => callback(err.toString()));
};
