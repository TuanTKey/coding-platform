/*
  seedProblems.js
  Usage:
    node -r dotenv/config src/scripts/seedProblems.js

  This script connects to the MongoDB configured by your environment (MONGODB_URI)
  and inserts a set of example problems with varied difficulties and tags.

  It is idempotent for problems that have the exact same `slug`.
*/

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const Problem = require('../models/Problem');

const problems = [
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    description: 'Given a string, return the string reversed.',
    difficulty: 'easy',
    timeLimit: 1,
    memoryLimit: 64,
    inputFormat: 'A single line containing the string s.',
    outputFormat: 'Print the reversed string.',
    constraints: '1 <= length(s) <= 100000',
    tags: ['string', 'two-pointers']
  },
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Given an array of integers and a target, return indices of the two numbers such that they add up to target.',
    difficulty: 'easy',
    timeLimit: 1,
    memoryLimit: 128,
    inputFormat: 'First line n and target; second line contains n integers.',
    outputFormat: 'Print two indices (1-based) or -1 if no solution.',
    constraints: '1 <= n <= 10^5, -10^9 <= nums[i] <= 10^9',
    tags: ['array', 'hash-table']
  },
  {
    title: 'Longest Increasing Subsequence',
    slug: 'longest-increasing-subsequence',
    description: 'Find the length of the longest strictly increasing subsequence.',
    difficulty: 'medium',
    timeLimit: 2,
    memoryLimit: 256,
    inputFormat: 'n then n integers',
    outputFormat: 'Length of LIS',
    constraints: '1 <= n <= 200000',
    tags: ['dp', 'binary-search']
  },
  {
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    description: 'Given a collection of intervals, merge all overlapping intervals.',
    difficulty: 'medium',
    timeLimit: 1,
    memoryLimit: 128,
    inputFormat: 'First line n; next n lines contain two integers start end.',
    outputFormat: 'Print the merged intervals, one per line.',
    constraints: '1 <= n <= 10^5',
    tags: ['sorting', 'intervals']
  },
  {
    title: 'Dijkstra Shortest Path',
    slug: 'dijkstra-shortest-path',
    description: 'Given a weighted graph, compute shortest path distances from source to all nodes.',
    difficulty: 'hard',
    timeLimit: 2,
    memoryLimit: 512,
    inputFormat: 'n m then m lines u v w',
    outputFormat: 'Print distances or -1 for unreachable nodes.',
    constraints: '1 <= n <= 2e5, 0 <= m <= 2e5',
    tags: ['graphs', 'dijkstra', 'priority-queue']
  },
  {
    title: 'Maximum Flow (Edmonds-Karp)',
    slug: 'maximum-flow-edmonds-karp',
    description: 'Compute the maximum flow from s to t using Edmonds-Karp algorithm.',
    difficulty: 'hard',
    timeLimit: 3,
    memoryLimit: 512,
    inputFormat: 'n m s t then m lines u v c',
    outputFormat: 'Single integer: max flow',
    constraints: '1 <= n <= 500, 0 <= m <= 5000',
    tags: ['graphs', 'maxflow', 'bfs']
  }
];

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding_platform';
  console.log('Connecting to', uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    for (const p of problems) {
      const existing = await Problem.findOne({ slug: p.slug });
      if (existing) {
        console.log(`Skipping existing problem: ${p.slug}`);
        continue;
      }

      const created = await Problem.create(p);
      console.log('Created problem:', created.slug);
    }

    console.log('Seeding finished.');
  } catch (err) {
    console.error('Error seeding problems:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
