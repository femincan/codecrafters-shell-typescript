import { commandsMap } from './command';
import { getAllExeNames } from './exe';

class TrieNode {
  isLeaf = false;
  children = new Map<string, TrieNode>();
}

let commandsTrie: TrieNode;

export function createCommandsTrie() {
  commandsTrie = createTrie(Array.from(commandsMap.keys()), getAllExeNames());
}

export function findCompletions(prefix: string) {
  let currentNode = commandsTrie;
  for (const char of prefix) {
    const next = currentNode.children.get(char);
    if (!next) {
      return [];
    }

    currentNode = next;
  }

  if (currentNode.isLeaf) {
    return [];
  }

  return collectCompletions(prefix, currentNode);
}

function collectCompletions(currentWord: string, node: TrieNode) {
  const derivetives: string[] = [];

  if (node.isLeaf) {
    derivetives.push(currentWord);
  }

  for (const [childNodeValue, childNode] of node.children.entries()) {
    derivetives.push(
      ...collectCompletions(currentWord + childNodeValue, childNode),
    );
  }

  return derivetives;
}

function createTrie(...wordLists: string[][]) {
  const rootNode = new TrieNode();

  for (const wordList of wordLists) {
    for (const word of wordList) {
      let currentNode = rootNode;
      for (const char of word) {
        if (!currentNode.children.has(char)) {
          currentNode.children.set(char, new TrieNode());
        }

        currentNode = currentNode.children.get(char)!;
      }

      currentNode.isLeaf = true;
    }
  }

  return rootNode;
}
