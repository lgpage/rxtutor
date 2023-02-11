import { cold } from 'jasmine-marbles';
import { of } from 'rxjs';
import { InputStream, OutputStream, Stream } from './stream';
import { StreamNode } from './types';

describe('Stream', () => {
  let stream: Stream;
  let nodes: StreamNode[];

  beforeEach(() => {
    nodes = [
      { id: 'D', kind: 'N', symbol: '3', x: 38, zIndex: 1 },
      { id: 'A', kind: 'N', value: '1', symbol: 'a', x: 8, zIndex: 2 },
      { id: 'C', kind: 'C', symbol: '|', x: 28, zIndex: 3 },
      { id: 'B', kind: 'N', value: '2', symbol: 'b', x: 18, zIndex: 4 },
    ];

    stream = new Stream({ dx: 10, dy: 10, offset: 3, frames: 20 });
  });

  it('should be created', () => {
    expect(stream).toBeTruthy();

    expect(stream.dx).toEqual(10);
    expect(stream.dy).toEqual(10);
    expect(stream.offset).toEqual(3);
    expect(stream.frames).toEqual(20);
  });

  describe('setNodes', () => {
    it('should return expected results', () => {
      stream.setNodes(nodes);

      expect(stream.entities$).toBeObservable(cold('0', [{
        A: { ...nodes[1], index: 0 },
        B: { ...nodes[3], index: 1 },
        C: { ...nodes[2], index: 2 },
      }]));

      expect(stream.nodes$).toBeObservable(cold('0', [[  // ordered by x
        { ...nodes[1], index: 0 },
        { ...nodes[3], index: 1 },
        { ...nodes[2], index: 2 },
      ]]));

      expect(stream.next$).toBeObservable(cold('0', [[  // only kind: 'N' ordered by x
        { ...nodes[1], index: 0 },
        { ...nodes[3], index: 1 },
      ]]));

      expect(stream.terminate$).toBeObservable(cold('0', [{ ...nodes[2], index: 2 }]));

      expect(stream.nodesToRender$).toBeObservable(cold('0', [[  // ordered by zIndex
        { ...nodes[1], index: 0 },
        { ...nodes[2], index: 2 },
        { ...nodes[3], index: 1 },
      ]]));

      expect(stream.marbles$).toBeObservable(cold('0', [
        { marbles: 'ab|', values: { a: '1', b: '2' }, error: null, canDisplayAsValue: true }
      ]));
    });
  });
});

describe('InputStream', () => {
  let stream: InputStream;
  let nodes: StreamNode[];

  beforeEach(() => {
    nodes = [
      { id: 'D', kind: 'N', symbol: '3', x: 38, zIndex: 1 },
      { id: 'A', kind: 'N', value: '1', symbol: 'a', x: 8, zIndex: 2 },
      { id: 'C', kind: 'C', symbol: '|', x: 28, zIndex: 3 },
      { id: 'B', kind: 'N', value: '2', symbol: 'b', x: 18, zIndex: 4 },
    ];

    stream = new InputStream({ dx: 10, dy: 10, offset: 3, frames: 20 }, nodes);
  });

  it('should be created', () => {
    expect(stream).toBeTruthy();
  });

  describe('updateNode', () => {
    it('updates nodes as expected', () => {
      stream.updateNode({ ...nodes[1], x: 15 });

      expect(stream.nodes$).toBeObservable(cold('0', [[  // ordered by x
        { ...nodes[1], index: 0, x: 15 },
        { ...nodes[3], index: 1 },
        { ...nodes[2], index: 2 },
      ]]));
    });
  });
});

describe('OutputStream', () => {
  let stream: OutputStream;
  let nodes: StreamNode[];

  beforeEach(() => {
    nodes = [
      { id: 'D', kind: 'N', symbol: '3', x: 38, zIndex: 1 },
      { id: 'A', kind: 'N', value: '1', symbol: 'a', x: 8, zIndex: 2 },
      { id: 'C', kind: 'C', symbol: '|', x: 28, zIndex: 3 },
      { id: 'B', kind: 'N', value: '2', symbol: 'b', x: 18, zIndex: 4 },
    ];

    stream = new OutputStream({ dx: 10, dy: 10, offset: 3, frames: 20 });
  });

  it('should be created', () => {
    expect(stream).toBeTruthy();
  });

  describe('setNodesUpdater', () => {
    it('updates nodes as expected', () => {
      stream.setNodesUpdater(of(nodes));

      expect(stream.nodes$).toBeObservable(cold('0', [[  // ordered by x
        { ...nodes[1], index: 0 },
        { ...nodes[3], index: 1 },
        { ...nodes[2], index: 2 },
      ]]));
    });
  });
});
