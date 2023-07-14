<script>
    import * as d3 from "d3";
    import numeral from 'numeral';

    import { tweened } from "svelte/motion";
    import { linear } from "svelte/easing";

	export let data

	let margin = {
		top: 16,
		right: 6,
		bottom: 6,
		left: 0,
	}

    const tweenedBars = tweened(null, { duration: 2000, easing: linear });
    const tweenedKeyframeMax = tweened(null, { duration: 2000, easing: linear });

    let currentIndex = 0

    const nextFrame = () => {
        if (currentIndex < data.bars.length - 1) {
            currentIndex += 1
        }
        /*
        currentIndex = currentIndex + 1
        if (currentIndex < data.bars.length) {
            tweenedBars.set(data.bars[currentIndex]).then(nextFrame)
        }
        */
    }
    let numBars = data.bars.length
    let barSize = 30

    console.log(numBars)

    let height = margin.top + barSize * numBars + margin.bottom
    let width = 910
    console.log('height', height)


    $: tweenedBars.set(data.bars[currentIndex]).then(nextFrame)
    $: tweenedKeyframeMax.set(d3.max(data.bars[currentIndex], d => d.value))

    //$: console.log('tweenedMax', $tweenedKeyframeMax)
    $: domain = [0, $tweenedKeyframeMax]
    //const yScale = d3.scaleBand()
    const yScale = d3.scaleLinear()
        .domain([0, numBars])
        .range([margin.top, margin.top + barSize * (numBars + 0.1)])

    console.log('yScales')
    console.log(yScale(1))
    console.log(yScale(1.1))

    $: xScale = d3.scaleLinear(domain, [margin.left, width - margin.right])

    //$: console.log('xScale(100)', xScale(100))

    let tweenPromise = tweenedBars.set(data.bars[currentIndex]).then(nextFrame)

</script>

<div>
    <h1>Bar Chart Race</h1>
    <p>This chart animates the value (in $M) of the top global brands from 2000 to 2019.</p>
    <p></p>

    {#each $tweenedBars as bar}
        <div class='bar' style="opacity:0.6; width:{bar.value}px;transform:translateY({bar.rank*60}px)">{bar.name}</div>
    {/each}

    <div style="position:relative; top: 300px;">
    <svg viewBox="0 0 {width} {height}">
        <g>
            {#each $tweenedBars as bar}
                <rect
                    x="0"
                    somey="{bar.rank* (barSize+5)}"
                    y="{yScale(Math.round(bar.rank))}"
                    width="{xScale(bar.value)}"
                    height="{barSize-5}"
                    fill="coral"
                    fill-opacity="0.6"
                />
            {/each}
        </g>
        <g text-anchor="end">
            {#each $tweenedBars as bar}
                <text class="bar-label"
                    style="transform:translate({xScale(bar.value) - 10}px, {bar.rank* (barSize+5) + barSize/2 + 10}px)"
                    x="0"
                    y="0"
                    dy="-0.25em">
                    {bar.name} - { numeral(bar.value).format('0,0') } - {yScale(Math.round(bar.rank))} : {bar.rank* (barSize+5) + barSize/2 + 10}

                </text>
            {/each}
        </g>

    </svg>
    </div>

</div>

<style>
    .bar {
        height: 50px;
        background-color: coral;
        margin-bottom: 10px;
        position: absolute;
    }
</style>