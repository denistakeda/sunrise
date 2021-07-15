import { MayersGraph, topologicalOrder, shortestPath, mayers } from '../src/Graph'

const graph = new MayersGraph<String>('bac'.split(''), 'cbcb'.split(''))
const smallGraph = new MayersGraph<String>(['a'], ['b'])

describe('DoubleStringGraph', () => {
    it('should calculate the graph size', () => {
        expect(graph.v()).toBe(20)
    })

    it('should return the right adjacency lists', () => {
        expect(graph.adj(0)).toEqual([
            { from: 0, to: 1, weight: 1 },
            { from: 0, to: 4, weight: 1 }
        ])
        expect(graph.adj(2)).toEqual([
            { from: 2, to: 7, weight: 0 }
        ])
        expect(graph.adj(3)).toEqual([
            { from: 3, to: 7, weight: 1 }
        ])
        expect(graph.adj(16)).toEqual([
            { from: 16, to: 17, weight: 1 }
        ])
        expect(graph.adj(19)).toEqual([])
    })
})

describe('topologicalOrder', () => {
    it('should sort small graph in a topological order', () => {
        expect(topologicalOrder(smallGraph, 0)).toEqual([0, 2, 1, 3])
    })
})

describe('shortestPath', () => {
    it('should provide a shortest path', ()=> {
        expect(shortestPath(graph, 0, 19)).toEqual([
            {from: 0, to: 4, weight: 1},
            {from: 4, to: 9, weight: 0},
            {from: 9, to: 10, weight: 1},
            {from: 10, to: 15, weight: 0},
            {from: 15, to: 19, weight: 1}
        ])
    })
})

describe('mayers', () => {
    it('should return the list of mutations', () => {
        expect(mayers('bac'.split(''), 'cbcb'.split(''))).toEqual([
            {kind: "insert", value: "c"},
            {kind: "skip", value: "b"},
            {kind: "delete", value: "a"},
            {kind: "skip", value: "c"},
            {kind: "insert", value: "b"}
        ])
    })
})
