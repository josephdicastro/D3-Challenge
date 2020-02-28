  //setup SVG container 
  let svgHeight = 600;
  let svgWidth = 900;
  let margin = {
      top: 20,
      right: 40,
      bottom:60,
      left: 100
  };

  let bodyHeight = svgHeight - margin.top - margin.bottom;
  let bodyWidth = svgWidth - margin.left - margin.right;

  let svg = d3.select("#scatter")
              .append("svg")
              .attr("width", svgWidth)
              .attr("height", svgHeight);

  let chartGroup = svg.append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("assets/data/data.csv").then(drawChart);

function drawChart(healthData) {
  

    //Step 1: Parse data / cast as numbers
    healthData.forEach(function(d) {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
        d.povertyMoe = +d.povertyMoe;
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
    })

    // Step 2: Create Scales 
    let xScale = d3.scaleLinear()
                    .domain([d3.min(healthData, d=> d.poverty) * 0.8, 
                             d3.max(healthData, d=> d.poverty) * 1.1])
                    .range([0,bodyWidth]);

    let yScale = d3.scaleLinear()
                    .domain([d3.min(healthData, d=> d.healthcare) * 0.5, 
                             d3.max(healthData, d=> d.healthcare) * 1.1])
                    .range([bodyHeight,0]);

    // Step 3: Create axis functions 
    let bottomAxis = d3.axisBottom(xScale);
    let leftAxis = d3.axisLeft(yScale);


    // Step 4: Append Axes to chart 

    // Step 4.A: bottom axis
    chartGroup.append('g')
                .attr('transform',`translate(0,${bodyHeight})`)
                .call(bottomAxis)
    
    chartGroup.append('text')
              .attr('transform',`translate(${bodyWidth/2},${bodyHeight + margin.top + 30})`)
              .text('In Poverty (%)')

    
    //Step 4.B: left axis 
    chartGroup.append('g')
              .call(leftAxis)

    chartGroup.append('text')
              .attr('transform','rotate(-90)')
              .attr('y', 0 - margin.left + 40)
              .attr('x', 0 - (bodyHeight/2) - 40)
              .attr('dy', '1em')
              .text('Lacking Healthcare (%)');

    //Step 5: Append Cirlces / create Scatterplot

    let circleGroup = chartGroup.append('g').selectAll('cirlce')
                                .data(healthData)
                                .enter()
                                    .append('circle')
                                    .attr('cx', function(d) {return xScale(d.poverty)})
                                    .attr('cy', function(d) {return yScale(d.healthcare)})
                                    .attr('r', '15')
                                    .attr('fill', 'lightblue')
                                    .attr('opacity', '.5')
                                    .text('hi')
    
    let labelGroup = chartGroup.append('g').selectAll('text')
                               .data(healthData)
                               .enter()
                                    .append('text')
                                    .text(function (d) {return d.abbr})
                                    .attr('x', function(d) {return xScale(d.poverty)-6})
                                    .attr('y', function(d) {return yScale(d.healthcare)+2})
                                    .attr('font-size','8px')
                                    .attr('font-weight','bold')


    
    //Step 6: Append Tooltips
    let toolTip = d3.tip()
                    .attr('class', 'tooltip')
                    .offset([5,5])
                    .html(function (d) { 
                        return (`${d.abbr}<br>
                        Lacking Healthcare(%): ${d.healthcare}<br>
                        Poverty(%): ${d.poverty}`)
                    })

    //Step 7: add tooltip to chart
    chartGroup.call(toolTip)

    //step 8: create event listeners
    circleGroup
        .on("mouseover", function (data) { toolTip.show(data,this); })
        .on("mouseout", function (data,index) {toolTip.hide(data)})

    labelGroup
        .on("mouseover", function (data) { toolTip.show(data,this);})
        .on("mouseout", function (data,index) {toolTip.hide(data)})

}