const d3 = require('d3');
const mentalHealthData = require('../static/state_time_phase.csv')
const stateName = require('../static/state_name.csv')
"use strict";
(function () {
  window.addEventListener("load", init);

  function init() {
    createStatesTimePhaseGraph("Arizona");
  }

  function generatenRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function createStatesTimePhaseGraph(state) {
    var timeLabelGraph = []
    var stateNameList = []
    var margin = {top: 20, right: 20, bottom: 50, left: 50},
         width = 960 - margin.left - margin.right,
         height = 500 - margin.top - margin.bottom;

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
      data.forEach(function(d) {
        stateNameList.push(d.State);
      });
    })

    /**
     * Get The data
     */
    d3.csv(mentalHealthData).then(function(data){

      data.forEach(function(d) {
          d.time_label = d["Time Period Label"];
          d.value = +d.Value;
          timeLabelGraph.push(d.time_label)
      });

      // Scale the range of the data
      x.domain(timeLabelGraph);
      y.domain([0, d3.max(data, function(d) { return d.value; })]);

      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("front-size", "14px")
      .style("text-anchor", "start")
      .attr("transform", "rotate(15 -10 10)");

      // Add the Y Axis
      svg.append("g")
          .call(d3.axisLeft(y));

      var stateLineList = [];

      stateNameList.forEach(function(state, index) {
          var cloneState = [...data];
          cloneState = cloneState.filter(function(d){
            return d.State == state;
          });

          var linePath = d3.line()
            .x(function(d){ return x(d.time_label) })
            .y(function(d){ return y(d.value) });

          const color = generatenRandomColor();
          const stateGraph = svg.append('g')
            .append('path')
            .attr('class', 'line-path')
            .attr('d', linePath(cloneState))
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke', color)
            .attr("transform",
              "translate(" + x.bandwidth() / 2 + "," + 0 + ")");

          stateLineList.push(stateGraph);
          // //画面积函数
          // var area = d3.area()
          //   .x(function(d) { return x(d.time_label); })
          //   .y0(height)
          //   .y1(function(d) { return y(d.value); });

          // svg.append("path")
          //     .data([data])
          //     .attr("class", "area")
          //     .attr("d", area)
          //     .attr("transform",
          //     "translate(" + x.bandwidth() / 2 + "," + 0 + ")");

        });

        var stateName = svg.append("div")
          .attr("class", "state-name")
          .style("opacity", 0);
        console.log(stateLineList);
        stateLineList.forEach(function(stateGraph, index){
          stateGraph.on('mouseover', function() {
            d3.selectAll(".line-path").attr("opacity", 0.2)
            d3.select(this).attr('opacity', 1);
            d3.select(this).attr('stroke-width', 4);
            stateName.attr('text', stateNameList[index]);
            stateName.style("opacity", 1);
          })
          stateGraph.on('mouseout', function() {
            d3.select(this).attr('stroke-width', 1);
            d3.selectAll(".line-path").attr("opacity", 1);
            stateName.style("opacity", 0)
          })
        })

      });

  }

})();