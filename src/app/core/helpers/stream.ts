import { StreamMarbles, StreamNode } from '../types';
import { getNotificationSymbol, isNextNotification } from './notification';
import { range, xToIndex } from './numerical';

const addNodeValue = (symbol: string, marbleValues: { [symbol: string]: any }, node: StreamNode): any => {
  if (!isNextNotification(node) || !node.value) {
    return null;
  }

  let value = marbleValues[symbol];

  if (!value) {
    marbleValues[symbol] = node.value;
    return node.value;
  }

  if (!Array.isArray(value)) {
    value = [value];
  }

  value.push(node.value);
  marbleValues[symbol] = value;
  return value;
};

const canDisplayValueAsSmallString = (value: any): boolean =>
  (value === null)
  || (typeof value === 'number' && `${value}`.length < 3)
  || (typeof value === 'string' && value.length < 3);

export const getStreamMarbles = (streamNodes: StreamNode[], dx: number, offset: number): StreamMarbles => {
  const nodesDict: { [index: number]: StreamNode[] } = {};
  const values: { [Symbol: string]: any } = {};
  const characters: string[] = [];

  let maxIndex = 0;
  for (const n of streamNodes) {
    const index = xToIndex(n.x, dx, offset);

    maxIndex = Math.max(maxIndex, index);
    nodesDict[index] = [...(nodesDict[index] ?? []), n];
  }

  let canDisplayAsValue = true;

  for (const i of range(maxIndex + 1)) {
    const nodes = nodesDict[i];
    if (!nodes) {
      characters.push('-');
      continue;
    }

    const single = nodes.length === 1;
    if (single) {
      const node = nodes[0];
      const symbol = getNotificationSymbol(node, node.symbol);
      const value = addNodeValue(symbol, values, node);
      canDisplayAsValue = canDisplayAsValue && canDisplayValueAsSmallString(value);

      characters.push(symbol);
      continue;
    }

    characters.push('(');
    for (const node of nodes) {
      const symbol = getNotificationSymbol(node, node.symbol);
      const value = addNodeValue(symbol, values, node);
      canDisplayAsValue = canDisplayAsValue && canDisplayValueAsSmallString(value);

      characters.push(symbol);
    }

    characters.push(')');
  }

  const hasValues = Object.keys(values).length >= 1;

  return {
    marbles: characters.join(''),
    values: hasValues ? values : null,
    error: null,
    canDisplayAsValue: hasValues && canDisplayAsValue,
  };
};
