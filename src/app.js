import { csv } from 'd3-fetch';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { line, polygon, stack, area } from 'd3-shape';
import { format } from 'd3-format';
import { extent } from 'd3-array';
import './main.css';

Promise.all([
  csv('./data/tiny_summary.csv'),
  csv('./data/tiny_annual_incidents.csv'),
  csv('./data/tiny_discipline_by_subgroup.csv')
]).then(myVis)
  .catch(error => { console.log(error) });

function myVis(results) {
  const [d_summary, d_annual, d_subgroup] = results;
  // const width = 5000;
  // const height = (36 / 24) * width;
  // const margin = { top: 20, left: 50, right: 10, bottom: 50 };

  // // NUMBER LINE PLOT
  // console.log(d_summary);
  // const margin = { top: 20, right: 30, bottom: 20, left: 60 },
  //   width = 400 - margin.left - margin.right,
  //   height = 80 - margin.top - margin.bottom;

  // const pct1_svg = select("#app")
  //   .append('svg')
  //   .attr("width", width + margin.left + margin.right)
  //   .attr("height", width + margin.top + margin.bottom)
  //   .append('g')
  //   .attr("transform",
  //     "translate(" + margin.left + "," + margin.top + ")");

  // pct1_svg.append('text')
  //   .attr('class', 'chart-title-small')
  //   .text(`Enrollment: ${d_summary[0]['ENROLLMENT']}`);

  // const x = scaleLinear().domain([0, 100]).range([0, width])
  // pct1_svg.append('g')
  //   .attr("transform", "translate(0," + height + ")")
  //   .call(axisBottom(x)
  //     .ticks()
  //     .tickFormat(format('d'))
  //     .tickValues([0, 25, 50, 75, 100]));

  // const y = scaleLinear().domain([0, 10]).range([height, 0])

  // pct1_svg
  //   .append("g")
  //   .selectAll("dot")
  //   .data(d_summary)
  //   .enter()
  //   .append("circle")
  //   .attr("cx", x(d_summary[0]['ENROLLMENT_PCT']))
  //   .attr("cy", y(5))
  //   .attr("r", 5)
  //   .attr("fill", "steelBlue");

  // pct1_svg
  //   .append('text')
  //   .attr('class', 'footnote')
  //   .attr("transform", `translate(0,${height + 2 * (margin.bottom)})`)
  //   .text('Percentile compared to all schools; hover for more details');

  // LINE GRAPH
  // MOSTLY WORKS: QUESTIONS: TEXT LABELS NOT APPEARING
  const margin = { top: 20, right: 30, bottom: 10, left: 60 },
    width = 400 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

  const line_svg = select("#app")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", width + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  line_svg.append('text')
    .attr('class', 'chart-title')
    .text('Total Incidents by School Year');

  const x_array = [2014, 2015, 2016, 2017]
  const y_array = [d_annual[0]['2014_TOTAL_INC'], d_annual[0]['2015_TOTAL_INC'], d_annual[0]['2016_TOTAL_INC'], d_annual[0]['2017_TOTAL_INC']]

  const ydim = extent(y_array);

  let data = []

  for (let i = 0; i < x_array.length; i++) {
    let ob = { x: x_array[i], y: y_array[i] }
    data.push(ob)
  }

  const x = scaleLinear().domain([2013.5, 2017.5]).range([0, width])
  line_svg.append('g')
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x)
      .ticks()
      .tickFormat(format('d'))
      .tickValues([2014, 2015, 2016, 2017]));

  const y = scaleLinear().domain([ydim[0] - 100, +ydim[1] + 100]).range([height, 0])
  // line_svg.append('g') //keep commented out
  //   .call(axisLeft(y)) //keep commented out
  //   .attr('transform', `translate(50,10)`); //keep commented out

  line_svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", 'steelBlue')
    .attr("stroke-width", 2)
    .attr("d", line()
      .x(function (d) { return x(d.x) })
      .y(function (d) { return y(d.y) }));

  // Add the points
  line_svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.x) })
    .attr("cy", function (d) { return y(d.y) })
    .attr("r", 3)
    .attr("fill", "steelBlue");

  line_svg.selectAll("text")
    .append('g')
    .data(data)
    .enter()
    .append("text")
    .text(function (d) { return x(d.y) })
    // .text('lab')
    .attr('x', function (d) { return x(d.x) + 10 })
    .attr('y', function (d) { return y(d.y) + 10 });


  // // PROPORTION PLOT – WORKS; HOW TO ORGANIZE SVGS??
  // const plotHeight = 400;
  // const svg = select("#app")
  //   .append("svg")
  //   .attr("width", 800)
  //   .attr("height", plotHeight + 100)
  //   .attr('transform', `translate(600,0)`);

  // svg.append('text')
  //   .attr('class', 'chart-title')
  //   .attr('x', 0)
  //   .attr('y', 15)
  //   .text(`${d_subgroup[0]['SCHOOL_DISTRICT']} - ${d_subgroup[0]['SCHOOL_NAME']} by ${d_subgroup[0]['SUBGROUP_CATEGORY']}`);

  // const x0 = 60;
  // const x1 = 400;
  // const scooch = 50;

  // svg.append('text')
  //   .attr('class', 'legend-title')
  //   .attr('x', 0)
  //   .attr('y', 42)
  //   .text('Overall Population');

  // svg.append('text')
  //   .attr('class', 'legend-title')
  //   .attr('x', 295)
  //   .attr('y', 42)
  //   .text('Disciplined Population');

  // svg.append('text')
  //   .attr('class', 'legend-title')
  //   .attr('x', 475)
  //   .attr('y', scooch + 12)
  //   .text(d_subgroup[0]['SUBGROUP_CATEGORY']);

  // svg.append('polygon')
  //   .attr('points', `${x0},${scooch}
  //       ${x1},${scooch}
  //       ${x1},${scooch + ((d_subgroup[0]['%_DISC_POP'] / 100) * plotHeight)}
  //       ${x0},${scooch + (d_subgroup[0]['%_OVERALL_POP'] / 100) * plotHeight}`)
  //   .attr('class', 'first');

  // svg.append('text')
  //   .attr('class', 'prop-label')
  //   .attr('x', x0 - 50)
  //   .attr('y', `${scooch + (d_subgroup[0]['CUM_%_OVERALL'] / 100) * plotHeight / 2}`)
  //   .text(`${(d_subgroup[0]['%_OVERALL_POP'])}%`);

  // svg.append('text')
  //   .attr('class', 'prop-label')
  //   .attr('x', 405)
  //   .attr('y', `${scooch + (d_subgroup[0]['CUM_%_DISC'] / 100) * plotHeight / 2}`)
  //   .text(`${(d_subgroup[0]['%_DISC_POP'])}%`);

  // svg.append('rect')
  //   .attr('class', 'first')
  //   .attr('height', '15px')
  //   .attr('width', '15px')
  //   .attr('x', 475)
  //   .attr('y', scooch + 25)

  // svg.append('text')
  //   .attr('class', 'prop-label')
  //   .attr('x', 495)
  //   .attr('y', scooch + 37)
  //   .text(d_subgroup[0]['SUBGROUP']);

  // const ordinalClasses = ['second', 'third', 'fourth', 'fifth', 'sixth', 'seventh']

  // for (let i = 0; i < ordinalClasses.length; i++) {
  //   svg.append('polygon')
  //     .attr('points', `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / 100) * plotHeight}
  //         ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / 100) * plotHeight}
  //         ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / 100) * plotHeight}
  //         ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //     .attr('class', ordinalClasses[i]);

  //   svg.append('rect')
  //     .attr('class', ordinalClasses[i])
  //     .attr('height', '15px')
  //     .attr('width', '15px')
  //     .attr('x', 475)
  //     .attr('y', scooch + (i * 20) + 45);

  //   svg.append('text')
  //     .attr('class', 'prop-label')
  //     .attr('x', 495)
  //     .attr('y', scooch + (i * 20) + 57)
  //     .text(d_subgroup[i + 1]['SUBGROUP']);

  //   if (d_subgroup[i + 1]['%_OVERALL_POP'] > 2) {
  //     svg.append('text')
  //       .attr('class', 'prop-label')
  //       .attr('x', x0 - 50)
  //       .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_OVERALL'] + +d_subgroup[i]['CUM_%_OVERALL']) / 200) * plotHeight}`)
  //       .text(`${(d_subgroup[i + 1]['%_OVERALL_POP'])}%`);

  //     svg.append('text')
  //       .attr('class', 'prop-label')
  //       .attr('x', 405)
  //       .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_DISC'] + +d_subgroup[i]['CUM_%_DISC']) / 200) * plotHeight}`)
  //       .text(`${(d_subgroup[i + 1]['%_DISC_POP'])}%`);
  //   }
  // }
}