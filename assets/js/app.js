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


var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "age";

function xScale(healthData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
    d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
//-------------------------------------------------------------------------------------------------------
function renderCircletext(circleText, newXScale, chosenXAxis) {

  circleText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circleText;
}
//-------------------------------------------------------------------------------------------------------
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "age") {
    var label = "Age:";
  }
  else {
    var label = "Poverty";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>Obesity ${d.obesity}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data, this);
  })
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

d3.csv("assets/data/healthData.csv", function (err, healthData) {

  healthData.forEach(function (data) {
    // XXX
    data.age = +data.age;
    data.poverty = +data.poverty; 
    // YYY
    data.obesity = +data.obesity; 
  });

  var xLinearScale = xScale(healthData, chosenXAxis);

  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d.obesity)])
    .range([height, 0]);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append("g")
    .call(leftAxis);

  // chartGroup.append("text")
  //   .attr("cx", d => xLinearScale(d[chosenXAxis]))
  //   .attr("cy", d => yLinearScale(d.obesity))
  //   .attr("text-anchor", "middle")
  //   .attr("y", ".3em")
  //   .text(function(d) {return d.abbr});

//------------ORDER MATTERS FOR TEXT OVERLAY-------------------------------------------------------------
//------------------------------------------------------------------------------------------------------- 
 var circleText = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("text")
    .attr("class", "stateText")
    .attr("alignment-baseline", "central")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.obesity))
    .text(d => d.abbr)
  
  
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 20)
    .attr("fill", "lightblue")
    .attr("opacity", ".5");


//------------------------------------------------------------------------------------------------------- 



  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age")
    .classed("active", true)
    .text("Age (Years)");

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty")
    .classed("inactive", true)
    .text("Poverty (%)");

  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obesity (%)");

  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  labelsGroup.selectAll("text")
    .on("click", function () {
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        chosenXAxis = value;

        xLinearScale = xScale(healthData, chosenXAxis);

        xAxis = renderAxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
//------------------------------------------------------------------------------------------------------- 

        circleText = renderCircletext(circleText, xLinearScale, chosenXAxis);

//------------------------------------------------------------------------------------------------------- 

        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
