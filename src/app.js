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
  let show_all = true
  const [d_summary, d_annual, d_subgroup] = results;

  // NUMBER LINE PLOT
  console.log(d_summary);
  let margin = { top: 20, right: 10, bottom: 20, left: 10 },
    width = 400 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  const pct1_svg = select("#left-3")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr('border-color', 'purple')
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
    ;

  pct1_svg.append('text')
    .attr('class', 'chart-title-small')
    .text(`Enrollment: ${format(',')(d_summary[0]['ENROLLMENT'])}`);

  if (show_all) {
    const x = scaleLinear().domain([0, 100]).range([0, width])
    pct1_svg.append('g')
      .attr("transform", "translate(0," + height / 2 + ")")
      .call(axisBottom(x)
        .ticks()
        .tickFormat(format('d'))
        .tickValues([0, 25, 50, 75, 100]));

    const y = scaleLinear().domain([0, 10]).range([10, 0])

    pct1_svg
      .append("g")
      .selectAll("dot")
      .data(d_summary)
      .enter()
      .append("circle")
      .attr("cx", x(d_summary[0]['ENROLLMENT_PCT']))
      .attr("cy", y(1))
      .attr("r", 5)
      .attr("class", "pct-dot");

    pct1_svg
      .append('text')
      .attr('class', 'footnote')
      .attr("transform", `translate(0,${height})`)
      .text('Percentile compared to all schools; hover for more details');
  }
  // LINE GRAPH
  let l_height = 150 - margin.top - margin.bottom;

  const line_svg = select("#left-7")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", l_height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  line_svg.append('text')
    .attr('class', 'chart-title-small')
    .text('Total Incidents by School Year')
    .attr('transform', 'translate (0, -4)');

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
    .attr("transform", "translate(0," + l_height + ")")
    .call(axisBottom(x)
      .ticks()
      .tickFormat(format('d'))
      .tickValues([2014, 2015, 2016, 2017]));

  const y = scaleLinear().domain([ydim[0] - 100, +ydim[1] + 200]).range([l_height - 10, 0])

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

  line_svg.selectAll(".annotation")
    .append('g')
    .data(data)
    .enter()
    .append("text")
    .attr('class', 'annotation')
    .text(function (d) { return format(",")(d.y) })
    .attr('x', function (d) { return x(d.x) + 10 })
    .attr('y', function (d) { return y(d.y) + 2 });


  // PROPORTION PLOT
  const plotHeight = 500;
  const svg = select("#right-box")
    .append("svg")
    .attr("width", 800)
    .attr("height", 650)
    .attr("transform",
      "translate(" + margin.left + ", 0)");

  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', 0)
    .attr('y', 15)
    .text(`${d_subgroup[0]['SCHOOL_DISTRICT']} - ${d_subgroup[0]['SCHOOL_NAME']} by ${d_subgroup[0]['SUBGROUP_CATEGORY']}`);

  const x0 = 60;
  const x1 = 400;
  const scooch = 50;

  svg.append('text')
    .attr('class', 'legend-title')
    .attr('x', 0)
    .attr('y', 42)
    .text('Overall Population');

  svg.append('text')
    .attr('class', 'legend-title')
    .attr('x', 295)
    .attr('y', 42)
    .text('Disciplined Population');

  svg.append('text')
    .attr('class', 'legend-title')
    .attr('x', 475)
    .attr('y', scooch + 12)
    .text(d_subgroup[0]['SUBGROUP_CATEGORY']);

  svg.append('polygon')
    .attr('points', `${x0},${scooch}
          ${x1},${scooch}
          ${x1},${scooch + ((d_subgroup[0]['%_DISC_POP'] / 100) * plotHeight)}
          ${x0},${scooch + (d_subgroup[0]['%_OVERALL_POP'] / 100) * plotHeight}`)
    .attr('class', 'first');

  svg.append('text')
    .attr('class', 'prop-label')
    .attr('x', x0 - 50)
    .attr('y', `${scooch + (d_subgroup[0]['CUM_%_OVERALL'] / 100) * plotHeight / 2}`)
    .text(`${(d_subgroup[0]['%_OVERALL_POP'])}%`);

  svg.append('text')
    .attr('class', 'prop-label')
    .attr('x', 405)
    .attr('y', `${scooch + (d_subgroup[0]['CUM_%_DISC'] / 100) * plotHeight / 2}`)
    .text(`${(d_subgroup[0]['%_DISC_POP'])}%`);

  svg.append('rect')
    .attr('class', 'first')
    .attr('height', '15px')
    .attr('width', '15px')
    .attr('x', 475)
    .attr('y', scooch + 25)

  svg.append('text')
    .attr('class', 'prop-label')
    .attr('x', 495)
    .attr('y', scooch + 37)
    .text(d_subgroup[0]['SUBGROUP']);

  const ordinalClasses = ['second', 'third', 'fourth', 'fifth', 'sixth', 'seventh']

  for (let i = 0; i < ordinalClasses.length; i++) {
    svg.append('polygon')
      .attr('points', `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / 100) * plotHeight}
            ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / 100) * plotHeight}
            ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / 100) * plotHeight}
            ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / 100) * plotHeight}`)
      .attr('class', ordinalClasses[i]);

    svg.append('rect')
      .attr('class', ordinalClasses[i])
      .attr('height', '15px')
      .attr('width', '15px')
      .attr('x', 475)
      .attr('y', scooch + (i * 20) + 45);

    svg.append('text')
      .attr('class', 'prop-label')
      .attr('x', 495)
      .attr('y', scooch + (i * 20) + 57)
      .text(d_subgroup[i + 1]['SUBGROUP']);

    if (d_subgroup[i + 1]['%_OVERALL_POP'] > 2) {
      svg.append('text')
        .attr('class', 'prop-label')
        .attr('x', x0 - 50)
        .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_OVERALL'] + +d_subgroup[i]['CUM_%_OVERALL']) / 200) * plotHeight}`)
        .text(`${(d_subgroup[i + 1]['%_OVERALL_POP'])}%`);

      svg.append('text')
        .attr('class', 'prop-label')
        .attr('x', 405)
        .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_DISC'] + +d_subgroup[i]['CUM_%_DISC']) / 200) * plotHeight}`)
        .text(`${(d_subgroup[i + 1]['%_DISC_POP'])}%`);
    }
  }
}