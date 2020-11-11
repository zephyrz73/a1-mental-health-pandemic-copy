import { csv, nest, mean, select, scaleBand, scaleLinear, max, axisBottom, axisLeft, line, selectAll } from 'd3';
import mentalHealthData from '../static/state_time_phase.csv';
import stateName from '../static/state_name.csv';
"use strict";
(function () {
  window.addEventListener("load", init);

  var selectedStateIndex = -1;

  function init() {
    createStatesTimePhaseGraph("Arizona");
    generateTable();
  }

  function generateTable() {
    csv(mentalHealthData).then(function(data){
      data.forEach(function(d) {
        d.state = d.State;
        d.value = +d.Value;
      });

      var stateAvgValue = nest()
        .key(function(d) { return d.state; })
        .rollup(function(v) { return Math.round(mean(v, function(d) { return d.value; }) * 100) / 100; })
        .entries(data);
      console.log(JSON.stringify(stateAvgValue));

      var table = select("#state_average_table").append("table");
      var tablebody = table.append("tbody");
      var rows = tablebody
          .selectAll("tr")
          .data(stateAvgValue)
          .enter()
          .append("tr");
      var cells = rows.selectAll("td")
          .data(function(row) {
              var kVList = ["key","value"];
              // he does it this way to guarantee you only use the
              // values for the columns you provide.
              return kVList.map(function(column) {
                  // return a new object with a value set to the row's column value.
                  return {value: row[column]};
              });
          })
          .enter()
          .append("td")
          .text(function(d) { return d.value; });
    });
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
    var margin = {top: 50, right: 35, bottom: 70, left: 50},
         width = 960 - margin.left - margin.right,
         height = 500 - margin.top - margin.bottom;

    // set the ranges
    var x = scaleBand().range([0, width])
    var y = scaleLinear().range([height, 0]);


    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = select("#state_time_phase_svg").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g").attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
    console.log(2)

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Percentage Of Population With Symptoms of Depressive Disorder During Covid-19 Phase 1 (4/23/2020-7/21/2020)");

    csv(stateName).then(function(data){
      data.forEach(function(d) {
        stateNameList.push(d.State);
      });
    })

    /**
     * Get The data
     */
    csv(mentalHealthData).then(function(data){

      data.forEach(function(d) {
          d.time_label = d["Time Period Label"];
          d.value = +d.Value;
          timeLabelGraph.push(d.time_label)
      });

      // Scale the range of the data
      x.domain(timeLabelGraph);
      y.domain([0, max(data, function(d) { return d.value; })]);

      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(axisBottom(x))
      .selectAll("text")
      .style("front-size", "14px")
      .style("text-anchor", "start")
      .attr("transform", "rotate(5 -10 10)");

      svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Time Period");

      // Add the Y Axis
      svg.append("g")
          .call(axisLeft(y));

      var stateLineList = [];

      svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Percentage Of Population Showing Depressive Disorder");

      var colorList = []
      stateNameList.forEach(function(state, index) {
          var cloneState = [...data];
          cloneState = cloneState.filter(function(d){
            return d.State == state;
          });

          var linePath = line()
            .x(function(d){ return x(d.time_label) })
            .y(function(d){ return y(d.value) });

          const color = generatenRandomColor();
          colorList.push(color);
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

        });
        stateLineList.forEach(function(stateGraph, index){
          stateGraph.on('mouseover', function() {
            selectAll(".line-path").attr("opacity", 0.2)
            select(this).attr('opacity', 1);
            select(this).attr('stroke-width', 4);
            select("#state_name")
              .attr('opacity', 1)
              .text(stateNameList[index]);
            qs("#graph_area #state_selected").style["border-color"] = colorList[index];
            qs("#state_average_table tbody").childNodes[index].style.backgroundColor = "purple";
            qs("#state_average_table tbody").childNodes[index].style.color = "white";
          })
          stateGraph.on('mouseout', function() {
            select(this).attr('stroke-width', 1);
            selectAll(".line-path").attr("opacity", 1);
            select("#state_name").attr('opacity', 0);
            qs("#state_average_table tbody").childNodes[index].style.backgroundColor="";
            qs("#state_average_table tbody").childNodes[index].style.color = "black";
            selectedStateIndex = -1;
          })
        })

      });

  }

  /**
* Returns the element that has the ID attribute with the specified value.
* @param {string} idName - element ID
* @returns {object} DOM object associated with id.
*/
function id(idName) {
  return document.getElementById(idName);
  }
  /**
  * Returns the first element that matches the given CSS selector.
  * @param {string} selector - CSS query selector.
  * @returns {object} The first DOM object matching the query.
  */
  function qs(selector) {
  return document.querySelector(selector);
  }
  /**
  * Returns the array of elements that match the given CSS selector.
  * @param {string} selector - CSS query selector
  * @returns {object[]} array of DOM objects matching the query.
  */
  function qsa(selector) {
  return document.querySelectorAll(selector);
  }
  /**
  * Returns a new element with the given tag name.
  * @param {string} tagName - HTML tag name for new DOM element.
  * @returns {object} New DOM object for given HTML tag.
  */
  function gen(tagName) {
  return document.createElement(tagName);
  }


})();