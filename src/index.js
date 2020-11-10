const d3 = require('d3');
const mentalHealthData = require('../static/state_time_phase.csv')
const stateName = require('../static/state_name.csv')
"use strict";
(
  function () {
  window.addEventListener("load", init);

  function init() {
    createStatesTimePhaseGraph("Arizona");
  }

  function createStatesTimePhaseGraph(state) {
    var timeLabelGraph = []
    var stateNameList = []
    var margin = {top: 20, right: 20, bottom: 50, left: 50},
         width = 960 - margin.left - margin.right,
         height = 500 - margin.top - margin.bottom;

    console.log(1)
    // set the ranges
    var x = d3.scaleBand().range([0, width])
    var y = d3.scaleLinear().range([height, 0]);


    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g").attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
    console.log(2)


    d3.csv(stateName).then(function(data){
      console.log(data)
      data.forEach(function(d) {
        stateNameList.push(d.State);
      });
    })

    // Get the data
    d3.csv(mentalHealthData).then(function(data){
      data = data.filter(function(d){
        return d.State == state;
      })
      data.forEach(function(d) {
          d.time_label = d["Time Period Label"];
          d.value = +d.Value;
          timeLabelGraph.push(d.time_label)
      });
      console.log(3)

      // Scale the range of the data
      x.domain(timeLabelGraph);
      y.domain([0, d3.max(data, function(d) { return d.value; })]);

      // // Add the valueline path.
      // svg.append("path")
      //     .data([data])
      //     .attr("class", "line")
      //     .attr("d", valueline);
      // console.log(4)
      // Add the X Axis
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .style("front-size", "14px")
          .style("text-anchor", "start")
          .attr("transform", "rotate(15 -10 10)");
      console.log(5)

      // Add the Y Axis
      svg.append("g")
          .call(d3.axisLeft(y));

      var linePath = d3.line()
        .x(function(d){ return x(d.time_label) })
        .y(function(d){ return y(d.value) });

      svg.append('g')
        .append('path')
        .attr('class', 'line-path')
        .attr('d', linePath(data))
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', 'green')
        .attr("transform",
          "translate(" + x.bandwidth() / 2 + "," + 0 + ")");

      //画面积函数
      var area = d3.area()
        .x(function(d) { return x(d.time_label); })
        .y0(height)
        .y1(function(d) { return y(d.value); });

      svg.append("path")
          .data([data])
          .attr("class", "area")
          .attr("d", area)
          .attr("transform",
          "translate(" + x.bandwidth() / 2 + "," + 0 + ")");

    });

  }

}

)();