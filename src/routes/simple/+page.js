export const ssr = false;
import * as d3 from "d3";



/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    let bars1 = [
        {name: 'A', value: 300, rank: 0},
        {name: 'B', value: 200, rank: 1},
        {name: 'C', value: 150, rank: 2}
    ]

    let bars2 = [
        {name: 'A', value: 220, rank: 1},
        {name: 'B', value: 400, rank: 0},
        {name: 'C', value: 200, rank: 2}
    ]

    let bars3 = [
        {name: 'A', value: 280, rank: 2},
        {name: 'B', value: 450, rank: 0},
        {name: 'C', value: 300, rank: 1}
    ]

    let bars = [bars1, bars2, bars3]

    return {
        bars
    };
}