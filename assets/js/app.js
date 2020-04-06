// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "income";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenXAxis]) *.9,
      d3.max(stateData, d => d[chosenXAxis]) 
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(stateData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var yAxis = d3.axisLeft(newYScale);

  // yAxis.transition()
  //   .duration(1000)
  //   .call(yAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale,
           chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity: ";
  }
  else if (chosenYAxis === "healthcare"){
    var ylabel = "% without Healthcare: ";
  }
  else if (chosenYAxis === "smokes"){
    var ylabel = "Smokes(%): ";
  }

  if (chosenXAxis === "income") {
    var label = "Household Income (Median):";
  }
  else if (chosenXAxis === "poverty"){
    var label = "% in Poverty";
  }
  else if (chosenXAxis === "age"){
    var label = "Age(Median)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
        return (`${d.state}<br>${ylabel} ${d[chosenYAxis]} <br> ${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseenter", function(d) {
    toolTip.show(d);
    d3.select(".circText").style("stroke", "#000");
  })
    // onmouseout event
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(".circText").style("stroke", "#white");

    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(stateData, err) {
  if (err) throw err;

  stateData.forEach(function(data) {
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.poverty = +data.poverty; 
  });
  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var yAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(yAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "blue")
    .attr("opacity", ".7")
    .classed("circle", true);

  var abbrText = chartGroup
    .append("text")
    .style("text-anchor", "middle")
    .selectAll("tspan")
    .data(stateData)
    .enter()
    .append("tspan")
    .text(function(d){
      return d.abbr;
    })
    .attr("x", function(d) {
      return xLinearScale(d[chosenXAxis]);
    })
    .attr("y", function(d) {
      // When the size of the text is the radius,
      // adding a third of the radius to the height
      // pushes it into the middle of the circle.
      return yLinearScale(d[chosenYAxis]);
    })
    .classed("circText", true);

  //update circle abbr
  function updateAbbr(chosenXaxis, chosenYAxis){

    //delete text from previous circles
    abbrText = chartGroup.selectAll("tspan").html("")

    //append new abbr text to circles
    abbrText = chartGroup
    .append("text")
    .style("text-anchor", "middle")
    .selectAll("tspan")
    .data(stateData)
    .enter()
    .append("tspan")
    .text(function(d){
      return d.abbr;
    })
    .attr("x", function(d) {
      return xLinearScale(d[chosenXAxis]);
    })
    .attr("y", function(d) {
      // When the size of the text is the radius,
      // adding a third of the radius to the height
      // pushes it into the middle of the circle.
      return yLinearScale(d[chosenYAxis]);
    })
    .classed("circText", true);
    return abbrText; 
  }



  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("House Hold Income (Median)");

    var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("Poverty %");

    var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age(Median)");

  // append y axis
  var obesityLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("yvalue", "obesity")
    // .classed("axis-text", true)
    .classed("active", true)
    .text("Obese (%)");

  var healthLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "2em")
    .attr("yvalue", "healthcare")
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  var smokerLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "3em")
    .attr("yvalue", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

  //y axis event listener 
  chartGroup.selectAll("text")
    .on("click", function(){

      var yvalue = d3.select(this).attr("yvalue");
     

      if (yvalue !== chosenYAxis){
        
        chosenYAxis = yvalue;
        console.log(`X: ${chosenXAxis}`)
        console.log(`Y: ${chosenYAxis}`)
      

      yLinearScale = yScale(stateData, chosenYAxis);

      yAxis = renderYAxes(yLinearScale, yAxis);

      circlesGroup = renderCircles(circlesGroup, xLinearScale, 
        chosenXAxis, yLinearScale, chosenYAxis);

      circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

      circAbbr = updateAbbr(chosenXAxis, chosenYAxis);

        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokerLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes"){
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokerLabel
            .classed("active", true)
            .classed("inactive", false);
          healthLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokerLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      
      if (value !== chosenXAxis) {

        // replaces chosenXaxis with value
        chosenXAxis = value;
        console.log(`X: ${chosenXAxis}`)
        console.log(`Y: ${chosenYAxis}`)
        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, 
                chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);
        
        circAbbr = updateAbbr(chosenXAxis, chosenYAxis);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else if (chosenXAxis === "poverty"){
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
