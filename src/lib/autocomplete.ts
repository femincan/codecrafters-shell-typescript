class TrieNode {
  isLeaf = false;
  children = new Map<string, TrieNode>();
}

export function createCommandsTrie(...commandNameLists: string[][]) {
  return createTrie(commandNameLists);
}

export function findCompletions(prefix: string, root: TrieNode) {
  let currentNode = root;
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

function createTrie(wordLists: string[][]) {
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
