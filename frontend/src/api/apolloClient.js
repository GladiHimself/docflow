import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from '@apollo/client/link/http';

const httpLink = new HttpLink({
    uri: import.meta.env.VITE_API_URL || 'http://localhost:8081/graphql',  // your Spring Boot GraphQL endpoint
});

// InMemoryCache stores query results locally
// So if you fetch the same data twice, it uses cache instead of hitting API again

const cache = new InMemoryCache();

const client = new ApolloClient({
    link: httpLink,
    cache: cache,
});

export default client;