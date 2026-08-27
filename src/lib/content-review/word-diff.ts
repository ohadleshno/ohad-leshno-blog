export type WordDiffPart = {
  text: string;
  changed: boolean;
};

function tokenize(text: string): string[] {
  return text.match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) ?? [];
}

function lcsTable(oldTokens: string[], newTokens: string[]): number[][] {
  const table = Array.from(
    { length: oldTokens.length + 1 },
    () => new Array<number>(newTokens.length + 1).fill(0),
  );
  for (let oldIndex = oldTokens.length - 1; oldIndex >= 0; oldIndex -= 1) {
    for (let newIndex = newTokens.length - 1; newIndex >= 0; newIndex -= 1) {
      table[oldIndex][newIndex] =
        oldTokens[oldIndex] === newTokens[newIndex]
          ? table[oldIndex + 1][newIndex + 1] + 1
          : Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1]);
    }
  }
  return table;
}

function mergeParts(parts: WordDiffPart[]): WordDiffPart[] {
  const normalized = parts.map((part, index) => {
    const betweenChanges =
      !part.changed &&
      /^\s+$/.test(part.text) &&
      parts[index - 1]?.changed === true &&
      parts[index + 1]?.changed === true;
    return betweenChanges ? { ...part, changed: true } : part;
  });
  const merged: WordDiffPart[] = [];
  for (const part of normalized) {
    const previous = merged[merged.length - 1];
    if (previous?.changed === part.changed) previous.text += part.text;
    else merged.push({ ...part });
  }
  return merged;
}

export function wordDiff(oldText: string, newText: string): {
  oldParts: WordDiffPart[];
  newParts: WordDiffPart[];
} {
  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);
  const table = lcsTable(oldTokens, newTokens);
  const oldParts: WordDiffPart[] = [];
  const newParts: WordDiffPart[] = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldTokens.length && newIndex < newTokens.length) {
    if (oldTokens[oldIndex] === newTokens[newIndex]) {
      oldParts.push({ text: oldTokens[oldIndex], changed: false });
      newParts.push({ text: newTokens[newIndex], changed: false });
      oldIndex += 1;
      newIndex += 1;
    } else if (table[oldIndex + 1][newIndex] >= table[oldIndex][newIndex + 1]) {
      oldParts.push({ text: oldTokens[oldIndex], changed: true });
      oldIndex += 1;
    } else {
      newParts.push({ text: newTokens[newIndex], changed: true });
      newIndex += 1;
    }
  }

  while (oldIndex < oldTokens.length) {
    oldParts.push({ text: oldTokens[oldIndex], changed: true });
    oldIndex += 1;
  }
  while (newIndex < newTokens.length) {
    newParts.push({ text: newTokens[newIndex], changed: true });
    newIndex += 1;
  }

  return {
    oldParts: mergeParts(oldParts),
    newParts: mergeParts(newParts),
  };
}
