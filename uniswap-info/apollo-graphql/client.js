const gql = require("graphql-tag");
const ApolloClient = require("apollo-client").ApolloClient;
const fetch = require("node-fetch");
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require("apollo-link-context").setContext;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;

export const client = new ApolloClient({
  link: createHttpLink({
    __uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
    uri: 'https://graph.mdex.com/subgraphs/name/mdex/swap',
    fetch: fetch
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const healthClient = new ApolloClient({
  link: createHttpLink({
    __uri: 'https://api.thegraph.com/index-node/graphql',
    uri: 'https://health.mdex.com/graphql',
    fetch: fetch
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const v1Client = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap',
    fetch: fetch
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const stakingClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/way2rach/talisman',
    fetch: fetch
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const blockClient = new ApolloClient({
  link: createHttpLink({
    __uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    uri: 'https://graph.mdex.com/subgraphs/name/mdex-heco-blocks',
    fetch: fetch
  }),
  cache: new InMemoryCache(),
});
