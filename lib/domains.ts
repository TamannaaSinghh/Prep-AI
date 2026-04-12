import { DomainConfig } from '@/types';

export const DOMAINS: Record<string, DomainConfig> = {
  dsa: {
    label: 'Data Structures & Algorithms',
    topics: ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Sorting', 'Dynamic Programming', 'Recursion'],
  },
  system_design: {
    label: 'System Design',
    topics: ['Load Balancing', 'Caching', 'Databases', 'Microservices', 'Message Queues', 'CAP Theorem', 'URL Shortener', 'Rate Limiting'],
  },
  javascript: {
    label: 'JavaScript',
    topics: ['Closures', 'Promises & Async/Await', 'Prototypes', 'Event Loop', 'ES6+ Features', 'DOM', 'Error Handling'],
  },
  react: {
    label: 'React',
    topics: ['Hooks', 'State Management', 'Virtual DOM', 'Component Lifecycle', 'Context API', 'Performance Optimization'],
  },
  dbms: {
    label: 'Database Management',
    topics: ['SQL Queries', 'Normalization', 'Indexing', 'Transactions', 'ACID Properties', 'NoSQL vs SQL'],
  },
  os: {
    label: 'Operating Systems',
    topics: ['Processes & Threads', 'Memory Management', 'Deadlocks', 'Scheduling', 'File Systems', 'Semaphores'],
  },
  networking: {
    label: 'Computer Networks',
    topics: ['TCP/IP', 'HTTP/HTTPS', 'DNS', 'Load Balancers', 'REST vs GraphQL', 'WebSockets'],
  },
};
