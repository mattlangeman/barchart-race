<script>
	import * as d3 from "d3";
    import numeral from 'numeral';
    import {createEventDispatcher, onMount} from 'svelte';
    import { tweened } from "svelte/motion";
    import { linear } from "svelte/easing";

    import { timer, elapsed } from "$lib/timer.js";

    /** @type {import('./$types').PageData} */
	export let data

    let duration = 2000
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

    const tweenedKeyframeData = tweened(null, { duration, easing: linear });
    const tweenedKeyframeMax = tweened(null, { duration, easing: linear });

    let currentFrameIndex = 0

    $: currentKeyframe = data.keyframes[currentFrameIndex]
    $: currentKeyframeData = currentKeyframe.data
    $: currentKeyframeDate = currentKeyframe.date

    const nextFrame = () => {
        if (currentFrameIndex < data.keyframes.length - 1) {
            currentFrameIndex += 1
        }
        /*
        currentFrameIndex = currentFrameIndex + 1
        if (currentFrameIndex < data.keyframes.length) {
            tweenedKeyframeData.set(data.keyframes[currentFrameIndex].data).then(nextFrame)
        }
        */
    }

    $: tweenedKeyframeData.set(currentKeyframeData).then(nextFrame)
    $: tweenedKeyframeMax.set(d3.max(currentKeyframeData, d => d.value))


    $: domain = [0, $tweenedKeyframeMax]
    const yScale = d3.scaleLinear()
        .domain([0, numBars])
        .range([margin.top, margin.top + barSize * (numBars + 0.1)])

    $: xScale = d3.scaleLinear(domain, [margin.left, width - margin.right])
    $: ticks = xScale.ticks(width / 160)


    function fillOpacity(rank) {
        if (rank >= numBars) {
            return 0
        } else {
            return 0.7
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
                fill="coral"
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
                style="transform:translate({xScale(d.value)-xScale(0)}px, {yScale(d.rank)}px)"
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
        {currentKeyframeDate.getUTCFullYear()}
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

    .bar-div {
        top: 0;
        left: 0;
        position: absolute;
    }
</style>