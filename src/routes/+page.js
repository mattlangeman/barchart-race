export const ssr = false;
import * as d3 from "d3";

let numBars = 12

function chartData(names, valueFunction) {
    let data = Array.from(names, name => ({name, value: valueFunction(name)}));
    data.sort((a, b) => d3.descending(a.value, b.value));
    let chartNames = []
    for (let i = 0; i < data.length; ++i) {
        data[i].rank = i;
        if (i < numBars) chartNames.push(data[i].name)
    }
    return {names: chartNames, data: data};
}


/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    // data for brand value by year
    let data = await d3.csv("/data/category-brands.csv", d3.autoType)

    // datevalues is an array of arrays
    // each inner array containing the date and map of brand name to value
    let datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
  						.map(([date, data]) => [new Date(date), data])
  						.sort(([a], [b]) => d3.ascending(a, b))

    // all brand names in the dataset
    let names = new Set(data.map(d => d.name))

    // create keyframes that interpolate between each date (year) in the dataset
    let keyframes = [];
    let ka, a, kb, b;
    let k = 10
    let allChartNames = []
    for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
            const t = i / k;
            let tmp = chartData(names, name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
            allChartNames = allChartNames.concat(tmp.names)
            keyframes.push({
                date: new Date(ka * (1 - t) + kb * t),
                data: tmp.data
            });
        }
    }
    let tmp = chartData(names, name => b.get(name) || 0)
    allChartNames = allChartNames.concat(tmp.names)
    keyframes.push({date: new Date(kb), data: tmp.data});
    let namesInChart = Array.from(new Set(allChartNames))

    let finalKeyframes = []
    for (let i = 0; i < keyframes.length; ++i) {
        let newKeyframe = {date: keyframes[i].date, data: []}
        let keyframeMap = new Map(keyframes[i].data.map(d => [d.name, d]))
        for (let j = 0; j < namesInChart.length; ++j) {
            newKeyframe.data.push(keyframeMap.get(namesInChart[j]))
        }
        finalKeyframes.push(newKeyframe)
    }

    keyframes = finalKeyframes
    return {
        data,
        namesInChart,
        keyframes
    };
}