<script>
	import * as d3 from "d3";
    import numeral from 'numeral';
    import { tweened } from "svelte/motion";
    import { linear } from "svelte/easing";

    /** @type {import('./$types').PageData} */
	export let data

    let duration = 250
	let barSize = 50
    let barPadding = 2
	let numBars = 12

	let margin = {
		top: 16,
		right: 6,
		bottom: 6,
		left: 0,
	}

    let height = margin.top + (barSize + barPadding) * numBars + margin.bottom
    let width = 910

    // We use a color scale to assign colors to each category.
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
    const categoryByName = new Map(data.data.map(d => [d.name, d.category]))
    colorScale.domain(Array.from(categoryByName.values()));

    // We use tweened values to animate between keyframes.
    // Note: data in each keyframe must have brands in the same order.
    //       Otherwise tweening cannot interpolate between them.
    const tweenedKeyframeData = tweened(null, { duration, easing: linear });
    // We need our max value to be tweened as well for our xScale tick marks.
    const tweenedKeyframeMax = tweened(null, { duration, easing: linear });


    let currentFrameIndex = 0
    $: currentKeyframe = data.keyframes[currentFrameIndex]
    $: currentKeyframeData = currentKeyframe.data
    $: currentKeyframeDate = currentKeyframe.date

    let isEnabled = true
    // tweened .set() returns a promise that resolves when the animation is finished.
    // when the promise resolves, we increment the frame index, which starts the next animation.
    const nextFrame = () => {
        if (isEnabled && currentFrameIndex < data.keyframes.length - 1) {
            currentFrameIndex += 1
        }
    }

    // set the tweened values to the current keyframe data
    $: tweenedKeyframeData.set(currentKeyframeData).then(nextFrame)
    $: tweenedKeyframeMax.set(d3.max(currentKeyframeData, d => d.value))

    $: xDomain = [0, $tweenedKeyframeMax]
    $: xScale = d3.scaleLinear(xDomain, [margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
        .domain([0, numBars])
        .range([margin.top, margin.top + (barSize + barPadding) * numBars])

    $: ticks = xScale.ticks(width / 160)

    // For any brands that are not in the current chart, make them transparent.
    const fillOpacity = rank => {
        if (rank >= numBars) {
            return 0
        } else {
            return 0.6
        }
    }

    const stopRace = () => {
        console.log("stopping race")
        isEnabled = false
    }
    const startRace = () => {
        console.log("start race")
        isEnabled = true
        nextFrame()
    }
    const resetRace = () => {
        console.log("reset race")
        currentFrameIndex = 0
    }
</script>

<div>
    <h1>Best Global Brands - Bar Chart Race</h1>
    <p>This chart animates the value (in $M) of the top global brands from 2000 to 2019. Data: <a href="https://www.interbrand.com/best-brands/">Interbrand</a></p>
    <p>Based off of <a href="https://observablehq.com/@d3/bar-chart-race-explained">Mike Bostock's barcart race in Observable</a></p>
</div>

<div class="controls">
    <button on:click="{startRace}">Start</button>
    <button on:click="{stopRace}">Stop</button>
    <button on:click="{resetRace}">Reset</button>


</div>

<div class="chart" bind:clientWidth="{width}">
    <!-- cannot bind svg dimensions https://github.com/sveltejs/svelte/issues/1955 -->
    <!-- instead, wrap svg inside div-->
    <svg width="100%" {height}>
        <g fill-opacity="0.6">
            {#each $tweenedKeyframeData as d (d.name)}
                <rect
                    data-name="{d.name}"
                    fill="{colorScale(categoryByName.get(d.name))}"
                    height="{barSize}"
                    x="{xScale(0)}"
                    y="{yScale(d.rank)}"
                    width="{xScale(d.value)-xScale(0)}"
                    fill-opacity="{fillOpacity(d.rank)}"
                    >
                </rect>
            {/each}
        </g>
        <g tranform="translate(0, {margin.top})">
            {#each ticks as x, i (i)}
                {#if i > 0} <!-- skip the first tick -->
                <g class="ticks" style="transform:translate({xScale(x)}px, 0px)">
                    <line
                        y2="{height}"
                        stroke="white"
                    />
                    <text class="tick-label"
                        y="5"
                        text-anchor="middle"
                        dominant-baseline="hanging">
                        { numeral(x).format('0,0') }
                    </text>
                </g>
                {/if}
        {/each}
        </g>
        <g text-anchor="end">
            {#each $tweenedKeyframeData as d (d.name)}
                <text class="bar-label"
                    style="transform:translate({xScale(d.value)-xScale(0)}px, {yScale(d.rank)}px)"
                    x="-6"
                    y="{barSize/2+1}"
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
            {currentKeyframeDate.getUTCFullYear()}
        </text>
    </svg>
</div>

<style>
    text.bar-label {
        font-size: 12px;
        font-family: sans-serif;
        fill: #333;
        font-weight: bold;
    }
    text.tick-label {
        font-size: 12px;
        font-family: sans-serif;
        fill: #333;
    }

    text.ticker {
        font-size: 36px;
        font-weight: bold;
        font-family: sans-serif;
        fill: #333;
    }
</style>