export const ssr = false;
import * as d3 from "d3";


function rank(names, value) {
    const data = Array.from(names, name => ({name, value: value(name)}));
    data.sort((a, b) => d3.descending(a.value, b.value));
    for (let i = 0; i < data.length; ++i) data[i].rank = i;
    return data;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    let data = await d3.csv("/data/category-brands.csv", d3.autoType)
    let names = new Set(data.map(d => d.name))
    let datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
  						.map(([date, data]) => [new Date(date), data])
  						.sort(([a], [b]) => d3.ascending(a, b))

    let keyframes = [];
    let ka, a, kb, b;
    let interpolationValue = 10
    // we want to interpolate between each date in order to smooth out the animation
    for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < interpolationValue; ++i) {
            const t = i / interpolationValue;
            keyframes.push([
                new Date(ka * (1 - t) + kb * t),
                rank(names, name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
            ]);
        }
    }
    keyframes.push([new Date(kb), rank(names, name => b.get(name) || 0)]);
    let nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)

    return {
        data,
        names,
        datevalues,
        nameframes,
        keyframes
    };
}