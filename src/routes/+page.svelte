<script>
	import * as d3 from "d3";

	let data = []

	d3.csv("/data/category-brands.csv", d3.autoType)
		.then(res => {
			data = res
		})

    let duration = 250
	let barSize = 48
	let numBars = 12
	let interpolationValue = 10

	let margin = {
		top: 16,
		right: 6,
		bottom: 6,
		left: 0,
	}

    let height = margin.top + barSize * numBars + margin.bottom
    let width = 910

    $: names = new Set(data.map(d => d.name))
	$: datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
  						.map(([date, data]) => [new Date(date), data])
  						.sort(([a], [b]) => d3.ascending(a, b))

	function rank(value) {
  		const data = Array.from(names, name => ({name, value: value(name)}));
  		data.sort((a, b) => d3.descending(a.value, b.value));
  		for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(numBars, i);
  		return data;
	}

    $: {
        let tmpRank = rank(name => datevalues[0][1].get(name))
        console.log('tmpRank', tmpRank)
    }

    let keyframes = []
    $: {
        const tmpKeyframes = [];
        let ka, a, kb, b;
        for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
            for (let i = 0; i < interpolationValue; ++i) {
            const t = i / interpolationValue;
            tmpKeyframes.push([
                new Date(ka * (1 - t) + kb * t),
                rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
            ]);
            }
        }
        tmpKeyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
        keyframes = tmpKeyframes
    }

    $: nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)

	$: prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
	$: next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))

	$: console.log('keyframes', keyframes)


	$: currentDate = keyframes[0][0]
	$: currentData = keyframes[0][1]

	$: console.log('currentDate', currentDate)
	$: console.log('currentData', currentData)


    const y = d3.scaleBand()
        .domain(d3.range(numBars + 1))
        .rangeRound([margin.top, margin.top + barSize * (numBars + 1 + 0.1)])
        .padding(0.1)

    $: barData = data.slice(0, numBars).sort((a, b) => d3.descending(a.value, b.value))
    $: console.log('barData', barData)
    $: domain = [0, d3.max(barData, d => d.value) || 1]
    $: xScale = d3.scaleLinear(domain, [margin.left, width - margin.right])


    $: console.log('y', y)
    $: console.log('xScale', xScale)

    $: {
        console.log('x0', xScale(0))
        console.log('x1', xScale(1))
    }


    $: ticks = xScale.ticks(width / 160)

</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

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
            <g transform="translate({xScale(x)}, 0)">
                <line
                    y2="{height}"
                    stroke="white"
                />
                <text
                    y="10"
                    text-anchor="middle"
                    dominant-baseline="hanging">
                    {x}
                </text>
            </g>
            {/if}
      {/each}
    </g>
    <g text-anchor="end">
        {#each barData as d, i}
            <text
                transform="translate({xScale(d.value)-xScale(0)}, {y(i)})"
                x="-6"
                y="21.5"
                dy="-0.25em">
                {d.name}
                <tspan fill-opacity="0.7" font-weight="normal" x="-6" dy="1.15em">{d.value}</tspan>
            </text>
        {/each}
    </g>
</svg>
{/if}

<svg viewBox="0 0 {width} {height}">
    <g fill-opacity="0.6">
        <rect fill="#f28e2c" height="43" x="0" y="21" width="904"></rect>
        <rect fill="#f28e2c" height="43" x="0" y="69" width="647.250276424708"></rect>
        <rect fill="#f28e2c" height="43" x="0" y="117" width="483.4241315568154"></rect>
        <rect fill="#f28e2c" height="43" x="0" y="165" width="420.0703036616135"></rect>
        <rect fill="#4e79a7" height="43" x="0" y="213" width="244.54284262789176"></rect>
        <rect fill="#f28e2c" height="43" x="0" y="261" width="235.79387041551223"></rect>
        <rect fill="#59a14f" height="43" x="0" y="309" width="217.06867713167208"></rect>
        <rect fill="#59a14f" height="43" x="0" y="357" width="196.17457234216042"></rect>
        <rect fill="#af7aa1" height="43" x="0" y="405" width="175.06434825670996"></rect>
        <rect fill="#edc949" height="43" x="0" y="453" width="171.16648238352806"></rect>
        <rect fill="#59a14f" height="43" x="0" y="501" width="159.92827899471058"></rect>
        <rect fill="#e15759" height="43" x="0" y="549" width="155.8413087375822"></rect>
    </g>
    <g tranform="translate(0, {margin.top})">

    </g>
</svg>