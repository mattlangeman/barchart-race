export const ssr = false;
import * as d3 from "d3";

let numBars = 12

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    let data = await d3.csv("/data/category-brands.csv", d3.autoType)
    let datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
  						.map(([date, data]) => [new Date(date), data])
  						.sort(([a], [b]) => d3.ascending(a, b))

    // Make a list of all the brands that are shown in the chart at any point in time
    let namesInChart = []
    let nameValueRanksByDate = []
    for (let i = 0; i < datevalues.length; i++) {
        let nameValueRanks = new Map()
        let tmpDate = datevalues[i][0]
        let tmpMap = datevalues[i][1]
        let tmpArr = Array.from(tmpMap.entries())
        for (let j = 0; j < tmpArr.length; j++) {
            let name = tmpArr[j][0]
            let value = tmpArr[j][1]
            let rank = j
            if (rank <= numBars) {
                namesInChart.push(name)
            }
            nameValueRanks.set(name, {name: name, value: value, rank: rank})
        }
        nameValueRanksByDate.push({date: tmpDate, data: nameValueRanks})
    }
    // Remove duplicates
    namesInChart = [...new Set(namesInChart)]

    // For each date, get the value and rank of each brand in the chart

    // TODO: We need to make sure that the brands are always in the same order
    let keyframes = []
    for (let i = 0; i < nameValueRanksByDate.length; i++) {
        let keyframeData = []
        let data = nameValueRanksByDate[i].data
        let nextRank = nameValueRanksByDate[i].data.size
        for (let j = 0; j < namesInChart.length; j++) {
            let name = namesInChart[j]
            let nameData = {name: name, value: 0, rank: nextRank}
            if (!data.has(name)) {
                nextRank++
            } else {
                nameData = data.get(name)
            }
            keyframeData.push(nameData)
        }
        keyframes.push({date: nameValueRanksByDate[i].date, data: keyframeData})
    }

    console.log('namesInChart', namesInChart)
    console.log('keyframes', keyframes)
    return {
        namesInChart,
        keyframes
    };
}