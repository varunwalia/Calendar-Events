const authResolver = require('./auth');
const eventsResolver = require('./events');

const rootResolver = {
  ...authResolver,
  ...eventsResolver
};


module.exports = rootResolver;
