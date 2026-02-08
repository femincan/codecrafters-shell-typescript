import type {
  Completer as ReadlineCompleter,
  Interface as ReadlineInterface,
} from 'readline/promises';
import { type CommandsMap } from './command';
import { getAllExeNames } from './exe';

class TrieNode {
  isLeaf = false;
  children = new Map<string, TrieNode>();
}

let commandsTrie: TrieNode;

export function createCommandsTrie(commandsMap: CommandsMap) {
  commandsTrie = createTrie(Array.from(commandsMap.keys()), getAllExeNames());
}

export function createCompleter(rl: ReadlineInterface): ReadlineCompleter {
  let previousPrefix = '';

  return async (prefix) => {
    const completions = findCompletions(prefix);

    if (!completions.length) {
      await Bun.stdout.write('\x07');
      return [[], prefix];
    }

    if (completions.length !== 1) {
      if (previousPrefix === prefix) {
        previousPrefix = '';

        await Bun.stdout.write('\n');
        await Bun.stdout.write(
          completions.toSorted(Intl.Collator('en').compare).join('  '),
        );
        await Bun.stdout.write('\n');
        rl.prompt(true);

        return [[], prefix];
      } else {
        previousPrefix = prefix;

        const lgs = getLongestCommonPrefix(completions);
        if (lgs && lgs !== prefix) {
          return [[lgs], prefix];
        }

        await Bun.stdout.write('\x07');
        return [[], prefix];
      }
    }

    return [[`${completions[0]} `], prefix];
  };
}

function findCompletions(prefix: string) {
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
  const completions: string[] = [];

  if (node.isLeaf) {
    completions.push(currentWord);
  }

  for (const [childNodeValue, childNode] of node.children.entries()) {
    completions.push(
      ...collectCompletions(currentWord + childNodeValue, childNode),
    );
  }

  return completions;
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

function getLongestCommonPrefix(strings: string[]) {
  if (!strings.length) return '';

  const firstStr = strings[0]!;

  let i = 0;
  while (true) {
    const char = firstStr[i];
    if (!char) return firstStr.slice(0, i);

    for (const str of strings) {
      if (str[i] !== char) {
        return firstStr.slice(0, i);
      }
    }

    i++;
  }
}
