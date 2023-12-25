const ThreadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'threads',
  version: '1.0.0',
  register: async (server, { container }) => {
    const threadHandler = new ThreadsHandler(container);
    server.route(routes(threadHandler));
  },
};
