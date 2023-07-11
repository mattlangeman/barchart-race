<script>
	import * as d3 from "d3";
    import { fade } from 'svelte/transition';
    import numeral from 'numeral';

    /** @type {import('./$types').PageData} */
	export let data

    console.log('data', data)
    let duration = 200
	let barSize = 48
	let numBars = 12

	let margin = {
		top: 16,
		right: 6,
		bottom: 6,
		left: 0,
	}

    let height = margin.top + barSize * numBars + margin.bottom
    let width = 910

	//$: prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
	//$: next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))

    const y = d3.scaleBand()
        .domain(d3.range(numBars + 1))
        .rangeRound([margin.top, margin.top + barSize * (numBars + 1 + 0.1)])
        .padding(0.1)

    let currentKeyframe = data.keyframes[0]

    $: currentKeyframeDate = currentKeyframe[0]
    $: currentKeyframeData = currentKeyframe[1]

    let barData = []
    let currentYear = 2000

    for (let i=0; i < numBars; i++) {
        barData.push({
            name: data.keyframes[0][1][i].name,
            value: data.keyframes[0][1][i].value,
            rank: data.keyframes[0][1][i].rank
        })
    }

    const timer = ms => new Promise(res => setTimeout(res, ms))

    async function playRace() {
        for (const keyframe of data.keyframes) {
            currentYear = keyframe[0]
            let tmpbarData = keyframe[1].slice(0, numBars)
            for (let i=0; i < numBars; i++) {
                barData[i].name = tmpbarData[i].name
                barData[i].value = tmpbarData[i].value
            }
            await timer(duration)
            /*
            const transition = svg.transition()
                .duration(duration)
                .ease(d3.easeLinear);
            barData = keyframe[1].slice(0, numBars)
            invalidation.then(() => svg.interrupt());
            await transition.end();
            */
        }
    }

    playRace()

    //$: barData = data.keyframes[190][1].slice(0, numBars)
    $: domain = [0, d3.max(barData, d => d.value) || 1]
    $: xScale = d3.scaleLinear(domain, [margin.left, width - margin.right])

    $: ticks = xScale.ticks(width / 160)


</script>

<div>
    <h1>Bar Chart Race</h1>
    <p>This chart animates the value (in $M) of the top global brands from 2000 to 2019.</p>
    <p></p>
</div>

{#if barData}
<svg viewBox="0 0 {width} {height}">
    <g fill-opacity="0.6">
        {#each barData as d, i}
            <rect fill="#cccccc"
                height="{y.bandwidth()}"
                x="{xScale(0)}"
                y="{y(i)}"
                width="{xScale(d.value)-xScale(0)}">
            </rect>
        {/each}
    </g>
    <g tranform="translate(0, {margin.top})">
        {#each ticks as x, i}
            {#if i > 0}
            <g class="ticks" style="transform:translate({xScale(x)}px, 0px)">
                <line
                    y2="{height}"
                    stroke="white"
                />
                <text
                    y="10"
                    text-anchor="middle"
                    dominant-baseline="hanging">
                    { numeral(x).format('0,0') }
                </text>
            </g>
            {/if}
      {/each}
    </g>
    <g text-anchor="end">
        {#each barData as d, i}
            <text class="bar-label"
                style="transform:translate({xScale(d.value)-xScale(0)}px, {y(i)}px)"
                x="-6"
                y="21.5"
                dy="-0.25em">
                {d.name}
                <tspan fill-opacity="0.7" font-weight="normal" x="-6" dy="1.15em">{ numeral(d.value).format('0,0') }</tspan>
            </text>
        {/each}
    </g>
    <text class="ticker"
        text-anchor="end"
        x="{width - 6}"
        y="{height - 6}"
        dy="0.0em"
        >
        {currentYear.getUTCFullYear()}
    </text>
</svg>
{/if}

<style>
    rect {
        transition: width 250ms ease-in-out;
    }

    g.ticks {
        transition: transform 250ms ease-in-out;
    }

    text {
        font-size: 12px;
        font-family: sans-serif;
        fill: #333;
    }

    text.bar-label {
        transition: transform 250ms ease-in-out;
    }

    text.ticker {
        font-size: 40px;
        font-family: sans-serif;
        fill: #333;
    }
</style>