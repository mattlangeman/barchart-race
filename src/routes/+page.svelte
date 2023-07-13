<script>
	import * as d3 from "d3";
    import numeral from 'numeral';
    import {createEventDispatcher, onMount} from 'svelte';
    import { tweened } from "svelte/motion";
    import { linear } from "svelte/easing";

    import { timer, elapsed } from "$lib/timer.js";

    /** @type {import('./$types').PageData} */
	export let data

    let duration = 100
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
    const tweenedKeyframeData = tweened(null, { duration, easing: linear });
    const tweenedKeyframeMax = tweened(null, { duration, easing: linear });

    colorScale.domain(Array.from(categoryByName.values()));

    let frameIndex = 0
    $: keyframe = data.keyframes[frameIndex]
    $: keyframeDate = keyframe[0]
    $: keyframeData = keyframe[1]

    console.log('names', data.names)
    $: currentData = Array.from(data.names).map((name)=> ({
        ...keyframeData.find((d) => d.name == name),
    }))

    $: console.log('currentData', currentData)

    $: tweenedKeyframeData.set(currentData)
    //$: console.log('tweenedKeyframeData', $tweenedKeyframeData)
    $: tweenedKeyframeMax.set(d3.max(keyframeData, d => d.value))
    $: domain = [0, $tweenedKeyframeMax]
    $: xScale = d3.scaleLinear(domain, [margin.left, width - margin.right])
    $: ticks = xScale.ticks(width / 160)

    let isEnabled = false

    $: if (isEnabled) frameIndex = Math.min(Math.floor($elapsed / duration), data.keyframes.length - 1);
    $: if (frameIndex === data.keyframes.length - 1) stopRace()
    $: console.log('frameIndex', frameIndex)


    function playRace() {
        isEnabled = true
        timer.start()
    }

    function stopRace() {
        isEnabled = false
        timer.stop()
    }

    onMount(() => {
        playRace()
    })


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


<svg id='id-bar-race' viewBox="0 0 {width} {height}">
    <g fill-opacity="0.6">
        {#each $tweenedKeyframeData as d (d.name)}
            <rect
                data-name="{d.name}"
                style="transform:translateY({y(d.rank)}px)"
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
        {#each $tweenedKeyframeData as d (d.name)}
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
        {keyframeDate.getUTCFullYear()}
    </text>
</svg>



<style>
    text {
        font-size: 12px;
        font-family: sans-serif;
        fill: #333;
    }

    text.ticker {
        font-size: 40px;
        font-family: sans-serif;
        fill: #333;
    }
</style>