const init = require('./services/secrets');
const poll = require('./services/poll');

init()
  .then((result) => {
    const feedUsername = Object.keys(result.data);
    const feedPassword = result.data[feedUsername];
    return { feedUsername, feedPassword };
  })
  .then(({ feedUsername, feedPassword }) => poll(feedUsername, feedPassword));
