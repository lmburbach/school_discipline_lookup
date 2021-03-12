import { csv } from 'd3-fetch';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { line } from 'd3-shape';
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
  // const [summary, annual, supgroup] = results;
  // reset below variables to specifics
  const [d_summary, d_annual, d_subgroup] = results;

  let show_all = true // update to be if the SYS_SCH != "ALL_SCHOOL_SYSTEMS - ALL_SCHOOLS"

  const summary_title = select('#left-title');
  summary_title.append('chart-title')
    .attr('class', 'chart-title')
    .text(`${d_summary[0]['SYS_SCH']}`);

  // ENROLLMENT PERCENTILE PLOT
  const margin = { top: 20, right: 10, bottom: 20, left: 10 },
    width = 400 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  const x_scale = scaleLinear().domain([0, 100]).range([0, width])
  const y_scale = scaleLinear().domain([0, 10]).range([17, 0])

  const enr_container = select("#left-3")
    .append('div')
    .attr('class', 'chart-container')
    .style('position', 'relative');

  const enr = enr_container
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  enr_container
    .append('div')
    .attr('id', 'tooltip')
    .style('pointer-events', 'none');

  enr.append('text')
    .attr('class', 'chart-title-small')
    .text(`Enrollment: ${format(',')(d_summary[0]['ENROLLMENT'])}`);

  enr.append('g')
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(axisBottom(x_scale)
      .ticks()
      .tickFormat(format('d'))
      .tickValues([0, 25, 50, 75, 100]));

  enr
    .append("g")
    .selectAll("dot")
    .data(d_summary)
    .enter()
    .append("circle")
    .attr("cx", x_scale(d_summary[0]['ENROLLMENT_PCT']))
    .attr("cy", y_scale(1))
    .attr("r", 6)
    .attr("class", "pct-dot")
    .on('mouseenter', function mouseEnter(e) { //not in the right place
      select(this).attr('fill', 'green');
      select('#tooltip')
        .style('top', y_scale(1))
        .style('left', x_scale(d_summary[0]['ENROLLMENT_PCT']))
        .text(d_summary[0]['ENROLLMENT_STATEMENT']);
    }).on('mouseleave', function mouseEnter(d) {
      select(this).attr('fill', 'steelblue');
      select('#tooltip').text('');
    });;

  enr
    .append('text')
    .attr('class', 'footnote')
    .attr("transform", `translate(0,${height})`)
    .text('Percentile ranking is charted above; hover for more details');

  // STUDENTS WITH INCIDENTS PERCENTILE PLOT
  const swi = select("#left-4")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top)
    .attr('border-color', 'purple')
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
    ;

  swi.append('text')
    .attr('class', 'chart-title-small')
    .text(`Students with Incidents: ${format(',')(d_summary[0]['STUDENTS_WITH_INCIDENTS'])} (${format(',')(d_summary[0]['%_SWI'])}% of students)`);

  swi.append('g')
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(axisBottom(x_scale)
      .ticks()
      .tickFormat(format('d'))
      .tickValues([0, 25, 50, 75, 100]));

  swi
    .append("g")
    .selectAll("dot")
    .data(d_summary)
    .enter()
    .append("circle")
    .attr("cx", x_scale(d_summary[0]['%_SWI_PCT']))
    .attr("cy", y_scale(1))
    .attr("r", 5)
    .attr("class", "pct-dot");

  // TOTAL INCIDENTS
  const ips = select("#left-5")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top)
    .attr('border-color', 'purple')
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
    ;

  ips.append('text')
    .attr('class', 'chart-title-small')
    .text(`Total Incidents: ${format(',')(d_summary[0]['TOTAL_INCIDENTS'])} (${format(',')(d_summary[0]['INCIDENTS_PER_STUDENT'])} incidents per student)`);

  ips.append('g')
    .attr("transform", "translate(0," + height / 2 + ")")
    .call(axisBottom(x_scale)
      .ticks()
      .tickFormat(format('d'))
      .tickValues([0, 25, 50, 75, 100]));

  ips
    .append("g")
    .selectAll("dot")
    .data(d_summary)
    .enter()
    .append("circle")
    .attr("cx", x_scale(d_summary[0]['INCIDENTS_PER_STUDENT_PCT']))
    .attr("cy", y_scale(1))
    .attr("r", 5)
    .attr("class", "pct-dot");

  // ANNUAL TRENDS LINE GRAPH
  const trends_title = select('#left-title2');
  trends_title.append('chart-title')
    .attr('class', 'chart-title')
    .text('Annual Total Incidents since SY 2014');

  const l_height = 125 - margin.top - margin.bottom;

  const line_svg = select("#left-6")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", l_height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

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

  const y = scaleLinear().domain([ydim[0] - 100, + ydim[1]]).range([l_height, 0])

  line_svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", 'steelBlue')
    .attr("stroke-width", 2)
    .attr("d", line()
      .x(function (d) { return x(d.x) })
      .y(function (d) { return y(d.y) }));

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

  line_svg.selectAll("annotation")
    .append('g')
    .data(data)
    .enter()
    .append("text")
    .attr('class', 'annotation')
    .text(function (d) { return format(",")(d.y) })
    .attr('x', function (d) { return x(d.x) + 10 })
    .attr('y', function (d) { return y(d.y) });

  // PROPORTION PLOT
  const x0 = 60;
  const x1 = 400;
  const scooch = 50;
  const plotHeight = 500;
  const svg = select("#right-top")
    .append("svg")
    .attr("width", 800)
    .attr("height", 650);

  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', 0)
    .attr('y', 15)
    .text(`${d_subgroup[0]['SYS_SCH']} by ${d_subgroup[0]['SUBGROUP_CATEGORY']}`);

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

  const overunder = select('#right-bottom')

  const PPTS = d_subgroup.map(a => a['PPTS']);
  // https://stackoverflow.com/questions/11301438/return-index-of-greatest-value-in-an-array
  const idx = PPTS.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

  overunder.append('text')
    .text(`${d_subgroup[idx]['SUBGROUP']} students are ${d_subgroup[idx]['OVER/UNDER']} in the disciplined population relative to their share of enrollment by ${d_subgroup[idx]['PPTS']} percentage points.`)
}