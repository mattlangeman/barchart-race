<script>
	import * as d3 from "d3";
    import numeral from 'numeral';

    /** @type {import('./$types').PageData} */
	export let data

    console.log('data', data)
    let duration = 560
	let barSize = 38
	let numBars = 12

	let margin = {
		top: 16,
		right: 6,
		bottom: 6,
		left: 0,
	}

    let height = margin.top + barSize * numBars + margin.bottom
    let width = 910

    const y = d3.scaleBand()
        .domain(d3.range(numBars + 1))
        .rangeRound([margin.top, margin.top + barSize * (numBars + 1 + 0.1)])
        .padding(0.1)


    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    const categoryByName = new Map(data.data.map(d => [d.name, d.category]))
    colorScale.domain(Array.from(categoryByName.values()));

    let barData = data.keyframes[0][1]
    let currentYear = data.keyframes[0][0]

    const timer = ms => new Promise(res => setTimeout(res, ms))

    async function playRace() {
        for (const keyframe of data.keyframes) {
            currentYear = keyframe[0]
            let newBarData = keyframe[1]
            barData = newBarData
            await timer(duration)
        }
    }

    playRace()

    $: domain = [0, d3.max(barData, d => d.value) || 1]
    $: xScale = d3.scaleLinear(domain, [margin.left, width - margin.right])

    $: ticks = xScale.ticks(width / 160)

    function fillOpacity(rank) {
        if (rank >= numBars) {
            return 0
        } else {
            return 0.6
        }
    }


</script>

<div>
    <h1>Bar Chart Race</h1>
    <p>This chart animates the value (in $M) of the top global brands from 2000 to 2019.</p>
    <p></p>
</div>

{#if barData}
<svg viewBox="0 0 {width} {height}">
    <g fill-opacity="0.6">
        {#each barData as d (d.name)}
            <rect
                data-name="{d.name}"
                style="transform:translate(0px, {y(Math.min(d.rank, numBars))}px)"
                fill="{colorScale(categoryByName.get(d.name))}"
                height="{y.bandwidth()}"
                x="{xScale(0)}"
                width="{xScale(d.value)-xScale(0)}"
                fill-opacity="{fillOpacity(d.rank)}"
                >
            </rect>
        {/each}
    </g>
    <g tranform="translate(0, {margin.top})">
        {#each ticks as x, i (i)}
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
        {#each barData as d (d.name)}
            <text class="bar-label"
                style="transform:translate({xScale(d.value)-xScale(0)}px, {y(Math.min(d.rank, numBars))}px)"
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
        transition: all 500ms ease-in-out;
    }


    g.ticks {
        transition: transform 500ms ease-in-out;
    }

    text {
        font-size: 12px;
        font-family: sans-serif;
        fill: #333;
    }

    text.bar-label {
        transition: transform 500ms ease-in-out;
    }

    text.ticker {
        font-size: 40px;
        font-family: sans-serif;
        fill: #333;
    }
</style>