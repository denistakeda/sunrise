export interface DirectedEdge {
    readonly from: number
    readonly to: number
    readonly weight: number
}

export interface EdgeWeightedDigraph {
    v(): number
    adj(v: number): DirectedEdge[]
}

export class MayersGraph<T> implements EdgeWeightedDigraph {
    constructor(private readonly oldS: T[], private readonly newS: T[]) {

    }

    public v(): number {
        return (this.oldS.length + 1) * (this.newS.length + 1)
    }

    // No need to store the adjacency list, we can generate it on the flight
    public adj(v: number): DirectedEdge[] {
        const [ newId, oldId ] = this.toCoord(v)

        let result: DirectedEdge[] = []
        if (oldId < this.oldS.length && newId < this.newS.length && this.oldS[oldId] === this.newS[newId]) {
            result.push({
                from: v,
                to: (newId + 1) * (this.oldS.length + 1) + oldId + 1,
                weight: 0,
            })
            return result
        }
        if (oldId < this.oldS.length)
            result.push({ from: v, to: v + 1, weight: 1 })
        if (newId < this.newS.length)
            result.push({ from: v, to: v + this.oldS.length + 1, weight: 1 })
        return result
    }

    public toCoord(v: number): [number, number] {
        return [Math.floor(v / (this.oldS.length + 1)), v % (this.oldS.length + 1)]
    }
}


export function topologicalOrder(g: EdgeWeightedDigraph, s: number): number[] {
    const order: number[] = []
    const marked: boolean[] = []
    // TODO: use the explicit stack instead of recursion
    const dfs = (g: EdgeWeightedDigraph, v: number) => {
        marked[v] = true
        for (let e of g.adj(v))
            if (!marked[e.to])
                dfs(g, e.to)

        order.unshift(v)
    }
    dfs(g, s)
    return order
}

// -- Shortest path --

export function shortestPath(g: EdgeWeightedDigraph, s: number, d: number): DirectedEdge[] {
    const edgeTo: DirectedEdge[] = []
    const distTo: number[] = Array(g.v()).fill(Number.MAX_SAFE_INTEGER)

    distTo[s] = 0
    for (let v of topologicalOrder(g, s)) {
        relax(g, v, edgeTo, distTo)
    }
    return pathTo(d, edgeTo)
}

function relax(g: EdgeWeightedDigraph, v: number, edgeTo: DirectedEdge[], distTo: number[]) {
    for (let e of g.adj(v)) {
        const w = e.to
        if (distTo[w] > distTo[v] + e.weight) {
            distTo[w] = distTo[v] + e.weight
            edgeTo[w] = e
        }
    }
}

function pathTo(d: number, edgeTo: DirectedEdge[]): DirectedEdge[] {
    const path: DirectedEdge[] = []
    for (let e = edgeTo[d]; e !== undefined; e = edgeTo[e.from])
        path.unshift(e)
    return path
}

// --------------------

// -- Mayer's algorithm --

interface InsertAction<T> {
    kind: 'insert',
    value: T,
}
interface DeleteAction<T> {
    kind: 'delete',
    value: T,
}
interface SkipAction<T> {
    kind: 'skip',
    value: T,
}
type Action<T> =  InsertAction<T> | DeleteAction<T> | SkipAction<T>

export function mayers<T>(oldArr: T[], newArr: T[]): Action<T>[] {
    const g = new MayersGraph(oldArr, newArr)
    const path = shortestPath(g, 0, g.v() - 1)
    return path.map(edge => {
        const [y1, x1] = g.toCoord(edge.from)
        const [y2, x2] = g.toCoord(edge.to)
        if (y2 > y1 && x2 > x1) return { kind: 'skip', value: newArr[y1]}
        else if (y2 > y1) return { kind: 'insert', value: newArr[y1]}
        else return { kind: 'delete', value: oldArr[x1] }
    })
}
