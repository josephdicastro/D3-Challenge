//setup SVG container 
let svgHeight = 600;
let svgWidth = 900;
let margin = {
    top: 20,
    right: 40,
    bottom:100,
    left: 100
};

let bodyHeight = svgHeight - margin.top - margin.bottom;
let bodyWidth = svgWidth - margin.left - margin.right;

let svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .style('border', '1px solid black')

let chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

// initialize default xAxis
let chosenXAxis = 'poverty';
let chosenYAxis = 'healthcare'

function xScale(healthData, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
                         .domain([d3.min(healthData, d=> d[chosenXAxis]) * 0.3,
                                  d3.max(healthData, d=> d[chosenXAxis]) * 1.2 ])
                         .range([0, bodyWidth])
    return xLinearScale;
}

function yScale(healthData, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
                         .domain([d3.min(healthData, d=> d[chosenYAxis]) * 0.3,
                                  d3.max(healthData, d=> d[chosenYAxis]) * 1.2 ])
                         .range([bodyHeight,0])
    return yLinearScale;
}

function renderXAxes(newXscale, xAxis) {
    let bottomAxis = d3.axisBottom(newXscale);
    xAxis.transition()
         .duration(1000)
         .call(bottomAxis);
    
    return xAxis;
}

function renderYAxes(newYscale, yAxis) {
    let leftAxis = d3.axisLeft(newYscale);
    yAxis.transition()
         .duration(1000)
         .call(leftAxis);
    
    return yAxis;
}

function renderCircles(circlesGroup, newXscale, chosenXAxis, newYscale, chosenYAxis) {
    circlesGroup.transition()
                .duration(1000)
                .attr('cx', d => newXscale(d[chosenXAxis]))
                .attr('cy', d => newYscale(d[chosenYAxis]))

    
    return circlesGroup;
}

function renderCircleLabels(cirLabelGroup, newXscale, chosenXAxis, newYscale, chosenYAxis) {
    cirLabelGroup.transition()
                .duration(1000)
                .attr('x', d => newXscale(d[chosenXAxis])-6)
                .attr('y', d => newYscale(d[chosenYAxis])+2)
    
    return cirLabelGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    let xlabel = '';
    let ylabel = '';

    switch (chosenXAxis) {
        case 'poverty':
            xlabel = 'In Poverty (%)';
            break;
        case 'age':
            xlabel = 'Age (Median)';
            break;
        case 'income':
            xlabel = 'Income (Median)';
            break;
    }
    switch (chosenYAxis) {
        case 'healthcare':
            ylabel = 'Lacks Healthcare (%)';
            break;
        case 'smokes':
            ylabel = 'Smokes (%)';
            break;
        case 'obesity':
            ylabel = 'Obesity (%)';
            break;
    }


    let toolTip = d3.tip()
                    .attr('class', 'tooltip')
                    .offset([5,5])
                    .html(function(d) {return (`${d.state}<br>
                                                ${ylabel}: ${d[chosenYAxis]}<br>
                                                ${xlabel}: ${d[chosenXAxis]}`)})
    
    circlesGroup.call(toolTip)
    circlesGroup
        .on('mouseover', function(data) {
            toolTip.show(data);
            circle = d3.select(d3.event.target)
            circle.attr('stroke','black')
                  .attr('stroke-width', '1px')
        })
        .on('mouseout', function(data) {
            circle.attr('stroke','black')
                  .attr('stroke-width', '0')
            toolTip.hide(data)
        });
    
    return circlesGroup
}


d3.csv("assets/data/data.csv").then(drawChart);

function drawChart(healthData) {
    //Parse data / cast as numbers
    healthData.forEach(function(d) {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
    })

    //set xScale for chosen axis
    let xLinearScale = xScale(healthData, chosenXAxis);
    let yLinearScale = yScale(healthData, chosenYAxis)
    
    //initiaize axes
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    let xAxis = chartGroup.append('g')
                          .classed('x-axis', true)
                          .attr('transform', `translate(0, ${bodyHeight})`)
                          .call(bottomAxis);
                    
    let yAxis = chartGroup.append('g')
                          .call(leftAxis)

    //append initial circles
    let circlesGroup = chartGroup.selectAll('circle')
                                 .data(healthData)
                                 .enter()
                                    .append('circle')
                                    .attr('cx', d => xLinearScale(d[chosenXAxis]))
                                    .attr('cy', d => yLinearScale(d[chosenYAxis]))
                                    .attr('r', 13)
                                    .attr('fill', 'lightblue')
                                    .attr('opacity', '0.5')

    let cirLabelGroup = chartGroup.append('g').selectAll('text')
                                    .data(healthData)
                                    .enter()
                                    .append('text')
                                    .text(function (d) {return d.abbr})
                                    .attr('x', d => xLinearScale(d[chosenXAxis])-6)
                                    .attr('y', d => yLinearScale(d[chosenYAxis])+2)
                                    .attr('font-size','8px')
                                    .attr('font-weight','bold')

    // create group for 2 x-axis labels
    let xLabelsGroup = chartGroup.append('g')
                                .attr('transform',`translate(${bodyWidth/2},${bodyHeight + 20})`);

    let inPovertyLabel = xLabelsGroup.append('text') 
                                    .attr('x',0)
                                    .attr('y',20)
                                    .attr('value', 'poverty')
                                    .classed('active', true)
                                    .text('In Poverty (%)') 
    
    let medianAgeLabel = xLabelsGroup.append('text') 
                                    .attr('x', 0)
                                    .attr('y', 40)
                                    .attr('value', 'age')
                                    .classed('inactive', true) 
                                    .text(' Age (Median)')  
                                    
    let medianIncomeLabel = xLabelsGroup.append('text') 
                                        .attr('x', 0)
                                        .attr('y', 60)
                                        .attr('value', 'income')
                                        .classed('inactive', true) 
                                        .text(' Income (Median)')    

    // create group for 2 y-axis labels
    let yLabelsGroup = chartGroup.append('g')

    let healthcareLabel = yLabelsGroup.append('text')
                                      .attr('transform','rotate(-90)')
                                      .attr('y', 0 - margin.left + 50)
                                      .attr('x', 0 - (bodyHeight/2) - 40)
                                      .attr('dy', '1em')
                                      .classed('active', true)
                                      .attr('value', 'healthcare')
                                      .text('Lacking Healthcare (%)');

    let obesityLabel = yLabelsGroup.append('text')
                                    .attr('transform','rotate(-90)')
                                    .attr('y', 0 - margin.left + 10)
                                    .attr('x', 0 - (bodyHeight/2) - 40)
                                    .attr('dy', '1em')
                                    .classed('inactive', true)
                                    .attr('value', 'obesity')
                                    .text('Obesity (%)');                                  

    let smokesLabel = yLabelsGroup.append('text')
                                    .attr('transform','rotate(-90)')
                                    .attr('y', 0 - margin.left + 30)
                                    .attr('x', 0 - (bodyHeight/2) - 40)
                                    .attr('dy', '1em')
                                    .classed('inactive', true)
                                    .attr('value', 'smokes')
                                    .text('Smokes (%)');   

    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    xLabelsGroup.selectAll('text')
        .on("click", function() {
            //get value of selection
            let xValue = d3.select(this).attr('value');
            if (xValue !== chosenXAxis) {
                chosenXAxis = xValue;
                xLinearScale = xScale(healthData, chosenXAxis);
                xAxis = renderXAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                cirLabelGroup = renderCircleLabels(cirLabelGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)
                
                switch (chosenXAxis) {
                    case 'poverty':
                        inPovertyLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        medianAgeLabel
                            .classed('active', false)
                            .classed('inactive', true)
                        medianIncomeLabel
                            .classed('active', false)
                            .classed('inactive', true)
                        break;

                    case 'age':
                        inPovertyLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        medianAgeLabel
                            .classed('active', true)
                            .classed('inactive', false)
                        medianIncomeLabel
                            .classed('active', false)
                            .classed('inactive', true)
                        break;
                    
                    case 'income':
                        inPovertyLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        medianAgeLabel
                            .classed('active', false)
                            .classed('inactive', true)
                        medianIncomeLabel
                            .classed('active', true)
                            .classed('inactive', false)
                        break;
                    
                }

            }
        })
        yLabelsGroup.selectAll('text')
        .on("click", function() {
            //get value of selection
            let yValue = d3.select(this).attr('value');
            if (yValue !== chosenYAxis) {
                chosenYAxis = yValue;
                yLinearScale = yScale(healthData, chosenYAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                cirLabelGroup = renderCircleLabels(cirLabelGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, yLinearScale, chosenYAxis)
                
                switch (chosenYAxis) {
                    case 'healthcare':
                        healthcareLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        obesityLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        smokesLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        break;

                    case 'obesity':
                        healthcareLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        obesityLabel
                            .classed('active', true)
                            .classed('inactive', false)
                        smokesLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        break;
                    
                    case 'smokes':
                        healthcareLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        obesityLabel
                            .classed('active', false)
                            .classed('inactive', true)
                        smokesLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        break;
                    
                }
            }
        })



}

