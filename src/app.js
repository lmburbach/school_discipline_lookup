import { csv } from 'd3-fetch';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { line } from 'd3-shape';
import { format } from 'd3-format';
import { min, max } from 'd3-array';
import './main.css';

Promise.all([
  csv('./data/summary.csv'),
  csv('./data/annual_incidents.csv'),
  csv('./data/discipline_by_subgroup.csv')
]).then(myVis)
  .catch(error => { console.log(error) });

function myVis(results) {
  const [summary, annual, subgroup] = results;

  // Set dropdown features
  const subgroups = [...new Set(subgroup.map(item => item['SUBGROUP_CATEGORY']))];
  const schools = [...new Set(subgroup.map(item => item['SYS_SCH_lookup']))];

  let temp_sys_sch = 'All School Systems – All Schools';
  let subgroup_selection = 'Disability Status';

  const sub_dropdown = select('#left-1')
    .append('div')
    .selectAll('.drop-down')
    .data([subgroups])
    .join('div');

  sub_dropdown.append('div').text(['Select Subgroup Category']);

  sub_dropdown
    .append('select')
    .on('change', function (event) {
      subgroup_selection = event.target.value;
      render();
    })
    .selectAll('options')
    .data(subgroups.map(subgroup => ({ subgroup })))
    .join('option')
    .text(d => d.subgroup);

  const sch_dropdown = select('#left-2')
    .append('div')
    .selectAll('.drop-down')
    .data([schools])
    .join('div');

  sch_dropdown.append('div').text(['Select School System/School']);

  sch_dropdown
    .append('select')
    .on('change', function (event) {
      temp_sys_sch = event.target.value;
      render();
    })
    .selectAll('options')
    .data(schools.map(SYS_SCH => ({ SYS_SCH })))
    .join('option')
    .text(d => d['SYS_SCH']);

  // STATE
  const summary_title = select('#left-title');
  const margin = { top: 0, bottom: 20, left: 10, right: 10 },
    width = 450 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  const x_scale = scaleLinear().domain([0, 100]).range([0, width])
  const y_scale = scaleLinear().domain([0, 10]).range([10, 0])

  // Enrollment Percentile Plot
  const enr_container = select("#left-3")
    .append('div')
    .attr('class', 'chart-container')
    .style('position', 'relative');
  const enr_title = enr_container.append('g')
  const enr = enr_container
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + ", 3)");
  const enr_scale = enr
    .append('g')
    .attr("transform", "translate(0," + height / 2 + ")");  // UPTICK
  const enr_circles = enr.append('g');
  const enr_footnote = enr.append('text');

  // Students with Incidents
  const swi_container = select("#left-4")
    .append('div')
    .attr('class', 'chart-container')
    .style('position', 'relative');
  const swi_title = swi_container.append('g')
  const swi = swi_container
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + ", 3)");
  const swi_scale = swi
    .append('g')
    .attr("transform", "translate(0," + height / 2 + ")");  // UPTICK
  const swi_circles = swi.append('g');

  // Incidents per Student
  const ips_container = select("#left-5")
    .append('div')
    .attr('class', 'chart-container')
    .style('position', 'relative');
  const ips_title = ips_container.append('g')
  const ips = ips_container
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + ", 3)");
  const ips_scale = ips
    .append('g')
    .attr("transform", "translate(0," + height / 2 + ")");
  const ips_circles = ips.append('g');

  // Annual Trends
  const trends_title = select('#left-title2');
  trends_title.append('chart-title')
    .attr('class', 'chart-title')
    .text('Total Discipline Incidents per Year');

  const l_height = 125 - margin.top - margin.bottom;

  const line_svg = select("#left-6")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", l_height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
  const line_axis = line_svg
    .append('g')
    .attr("transform", "translate(0," + l_height + ")");
  const line_path = line_svg.append("path");
  const line_dots = line_svg.append("g");
  const line_labels = line_svg.append("g");

  // Proportion Plot
  const x0 = 60;
  const x1 = 400;
  const scooch = 60;
  const plotHeight = 575;

  const svg_container = select("#right-top")
    .append('div')
    .attr('class', 'chart-container')
    .style('position', 'relative');

  const svg = svg_container
    .append("svg")
    .attr("width", 800)
    .attr("height", plotHeight + 100);
  svg.append('text')
    .attr('class', 'legend-title')
    .attr('x', 0)
    .attr('y', 50)
    .text('Overall Population');
  svg.append('text')
    .attr('class', 'legend-title')
    .attr('x', 295)
    .attr('y', 50)
    .text('Disciplined Population');

  const prop_title = svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', 0)
    .attr('y', 15)
  const prop_legend_title = svg.append('text')
    .attr('class', 'legend-title')
    .attr('x', 475)
    .attr('y', scooch + 12)

  const poly_1 = svg.append('polygon');
  const left_1 = svg.append('text')
    .attr('class', 'prop-label');
  const right_1 = svg.append('text')
    .attr('class', 'prop-label');
  const legend_1 = svg.append('rect')
  const lab_1 = svg.append('text')
    .attr('class', 'prop-label');

  const poly_2 = svg.append('polygon');
  const left_2 = svg.append('text')
    .attr('class', 'prop-label');
  const right_2 = svg.append('text')
    .attr('class', 'prop-label');
  const legend_2 = svg.append('rect')
  const lab_2 = svg.append('text')
    .attr('class', 'prop-label');

  const poly_3 = svg.append('polygon');
  const left_3 = svg.append('text')
    .attr('class', 'prop-label');
  const right_3 = svg.append('text')
    .attr('class', 'prop-label');
  const legend_3 = svg.append('rect')
  const lab_3 = svg.append('text')
    .attr('class', 'prop-label');

  const poly_4 = svg.append('polygon');
  const left_4 = svg.append('text')
    .attr('class', 'prop-label');
  const right_4 = svg.append('text')
    .attr('class', 'prop-label');
  const legend_4 = svg.append('rect')
  const lab_4 = svg.append('text')
    .attr('class', 'prop-label');

  const poly_5 = svg.append('polygon');
  const left_5 = svg.append('text')
    .attr('class', 'prop-label');
  const right_5 = svg.append('text')
    .attr('class', 'prop-label');
  const legend_5 = svg.append('rect')
  const lab_5 = svg.append('text')
    .attr('class', 'prop-label');

  const poly_6 = svg.append('polygon');
  const left_6 = svg.append('text')
    .attr('class', 'prop-label');
  const right_6 = svg.append('text')
    .attr('class', 'prop-label');
  const legend_6 = svg.append('rect')
  const lab_6 = svg.append('text')
    .attr('class', 'prop-label');

  const poly_7 = svg.append('polygon');
  const left_7 = svg.append('text')
    .attr('class', 'prop-label');
  const right_7 = svg.append('text')
    .attr('class', 'prop-label');
  const legend_7 = svg.append('rect')
  const lab_7 = svg.append('text')
    .attr('class', 'prop-label');

  const overunder = select('#right-bottom');

  const help = svg.append('g')

  help.append('rect')
    .attr('x', 480)
    .attr('y', 610)
    .attr('height', '25px')
    .attr('width', '200px')
    .attr('class', 'help-button')
    ;

  help.append('text')
    .attr('x', 495)
    .attr('y', 620)
    .attr('dy', '.50em')
    .text("Help me interpret this chart")
    .attr('class', 'help-text')
    .on('mouseover', function mouseEnter(e) {
      console.log(e)
      svg_container.append('div')
        .attr('id', 'help_hover')
        .attr('class', 'help-tooltip')
        .style('top', '350px')
        .style('left', '450px')
        // https://stackoverflow.com/questions/13049050/can-you-insert-a-line-break-in-text-when-using-d3-js
        .text("This chart compares the proportion of the overall enrollment for a group to that group's proportion of the disciplined student population (students with one or more recorded discipline incidents). If the shape's area gets larger from left to right, that means the portion of the disciplined population exceeds the portion of the enrolled population for that group (i.e. the group is overrepresented in the discipline population). If the area gets smaller, the group is underrepresented in the disciplined population relative to their enrollment. If each group's representation in the disciplined population were equal to its share of enrollment, we would expect to see no changes in height from left to right; each group's shape would just be a rectangle.");
    }).on('mouseout', function mouseEnter(e) {
      select('#help_hover').remove();
    });

  function render() {
    // Filter data based on user selection
    let d_subgroup = [];
    for (let i = 0; i < subgroup.length; i++) {
      if ((subgroup[i]['SYS_SCH_lookup'] === temp_sys_sch) && (subgroup[i]['SUBGROUP_CATEGORY'] === subgroup_selection)) {
        d_subgroup.push(subgroup[i]);
      }
    }

    let sys_sch_selection = d_subgroup[0]['SYS_SCH'];

    let d_summary = [];
    for (let i = 0; i < summary.length; i++) {
      if (summary[i]['SYS_SCH'] === sys_sch_selection) {
        d_summary.push(summary[i]);
      }
    }

    let d_annual = [];
    for (let i = 0; i < annual.length; i++) {
      if (annual[i]['SYS_SCH'] === sys_sch_selection) {
        d_annual.push(annual[i]);
      }
    }

    let show = ''
    if (sys_sch_selection != 'All School Systems – All Schools') {
      show = 'block';
    }
    else {
      show = 'none';
    }

    summary_title.selectAll('st')
      .data(d_summary)
      .join('st')
      .attr('class', 'chart-title')
      .text(d => d['SYS_SCH']);

    //Enrollment
    enr_title.selectAll('enr_text')
      .data(d_summary)
      .join('enr_text')
      .attr('class', 'chart-title-small')
      .text(d => `Enrollment: ${format(',')(d['ENROLLMENT'])} students`);

    enr_scale.call(axisBottom(x_scale)
      .ticks()
      .tickFormat(format('d'))
      .tickValues([0, 25, 50, 75, 100]))
      .style('display', show);

    enr_circles
      .selectAll(".enr_circle")
      .data(d_summary)
      .join("circle")
      .attr("cx", d => x_scale(d['ENROLLMENT_PCT']))
      .attr("cy", y_scale(1))
      .attr("r", 6)
      .attr('class', 'enr_circle')
      .attr('fill', '#02323B')
      .attr('stroke', 'black')
      .style('display', show)
      .on('mouseover', function mouseEnter(e) {
        select(this)
          .attr('fill', '#FCA375')
        enr_container.append('div')
          .attr('id', 'enr_hover')
          .attr('class', 'tooltip')
          .style('top', '-5px')
          .style('left', `${x_scale(d_summary[0]['ENROLLMENT_PCT']) + 20}px`)
          .text(d_summary[0]['ENROLLMENT_STATEMENT']);
      }).on('mouseout', function mouseEnter(e) {
        select(this)
          .attr('fill', '#02323B')
        select('#enr_hover').remove();
      });

    enr_footnote
      .attr('class', 'footnote')
      .attr("transform", `translate(0,${height})`)
      .text('Percentile ranking is charted above; hover for more details')
      .style('display', show);

    // Students with Incidents
    swi_title.selectAll('swi_text')
      .data(d_summary)
      .join('swi_text')
      .attr('class', 'chart-title-small')
      .text(d => `
        Students with Incidents: ${format(',')(d['STUDENTS_WITH_INCIDENTS'])} students
         (${format(',')(d['%_SWI'])}% of students)`);

    swi_scale.call(axisBottom(x_scale)
      .ticks()
      .tickFormat(format('d'))
      .tickValues([0, 25, 50, 75, 100]))
      .style('display', show);

    swi_circles
      .selectAll(".swi_circle")
      .data(d_summary)
      .join("circle")
      .attr("cx", d => x_scale(d['%_SWI_PCT']))
      .attr("cy", y_scale(1))
      .attr("r", 6)
      .attr('class', 'swi_circle')
      .attr('fill', '#02323B')
      .attr('stroke', 'black')
      .style('display', show)
      .on('mouseover', function mouseEnter(e) { //needs attention
        select(this)
          .attr('fill', '#FCA375')
        swi_container.append('div')
          .attr('id', 'swi_hover')
          .attr('class', 'tooltip')
          .style('top', '-5px')
          .style('left', `${x_scale(d_summary[0]['%_SWI_PCT']) + 20}px`)
          .text(d_summary[0]['%_SWI_STATEMENT']);
      }).on('mouseout', function mouseEnter(e) {
        select(this)
          .attr('fill', '#02323B')
        select('#swi_hover').remove();
      });

    // Incidents per Student
    ips_title.selectAll('ips_text')
      .data(d_summary)
      .join('ips_text')
      .attr('class', 'chart-title-small')
      .text(d => `
        Total Incidents: ${format(',')(d['TOTAL_INCIDENTS'])} incidents
         (${format(',')(d['INCIDENTS_PER_STUDENT'])} incidents per student)`);

    ips_scale.call(axisBottom(x_scale)
      .ticks()
      .tickFormat(format('d'))
      .tickValues([0, 25, 50, 75, 100]))
      .style('display', show);

    ips_circles
      .selectAll(".ips_circle")
      .data(d_summary)
      .join("circle")
      .attr("cx", d => x_scale(d['INCIDENTS_PER_STUDENT_PCT']))
      .attr("cy", y_scale(1))
      .attr("r", 6)
      .attr('class', 'ips_circle')
      .attr('fill', '#02323B')
      .attr('stroke', 'black')
      .style('display', show)
      .on('mouseover', function mouseEnter(e) { //needs attention
        select(this)
          .attr('fill', '#FCA375')
        ips_container.append('div')
          .attr('id', 'ips_hover')
          .attr('class', 'tooltip')
          .style('top', '-5px')
          .style('left', `${x_scale(d_summary[0]['INCIDENTS_PER_STUDENT_PCT']) + 20}px`)
          .text(d_summary[0]['INCIDENTS_PER_STUDENT_STATEMENT']);
      }).on('mouseout', function mouseEnter(e) {
        select(this)
          .attr('fill', '#02323B')
        select('#ips_hover').remove();
      });

    // Annual trends
    let x_array = [2014, 2015, 2016, 2017]
    x_array = x_array.slice((4 - d_annual[0]['YEARS']), 4)
    let x = scaleLinear().domain([(min(x_array) - .5), (max(x_array) + .5)]).range([0, width])

    let y_arr = [d_annual[0]['2014'], d_annual[0]['2015'], d_annual[0]['2016'], d_annual[0]['2017']]
    y_arr = y_arr.slice((4 - d_annual[0]['YEARS']), 4)
    let y_array = y_arr.map((i) => Number(i));

    let data = []
    for (let i = 0; i < x_array.length; i++) {
      let ob = { x: x_array[i], y: y_array[i] }
      data.push(ob)
    }

    line_axis.attr("transform", "translate(0," + l_height + ")").call(axisBottom(x)
      .ticks()
      .tickFormat(format('d'))
      .tickValues([2014, 2015, 2016, 2017]));

    let cushion = (max(y_array) - min(y_array))

    let y = scaleLinear().domain([(min(y_array)) - cushion, (max(y_array) + cushion)]).range([l_height, 0])

    line_path
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", '#FCA375')
      .attr("stroke-width", 2)
      .attr("d", line()
        .x(function (d) { return x(d.x) })
        .y(function (d) { return y(d.y) }));

    line_dots
      .selectAll(".dot")
      .data(data)
      .join("circle")
      .attr('class', 'dot')
      .attr("cx", function (d) { return x(d.x) })
      .attr("cy", function (d) { return y(d.y) })
      .attr("r", 3)
      .attr("fill", "#FCA375");

    line_labels
      .selectAll(".annotation")
      .data(data)
      .join("text")
      .attr('class', 'annotation')
      .text(function (d) { return format(",")(d.y) })
      .attr('x', function (d) { return x(d.x) - 10 })
      .attr('y', function (d, i) {
        if (i === 0) {
          return y(d.y) - 15;
        }
        else {
          const offset = d.y > data[i - 1].y ? -15 : 15;
          return y(d.y) + offset;
        }
      })

    // PROPORTION PLOT
    let overall_max = d_subgroup[(d_subgroup.length - 1)]['CUM_%_OVERALL']
    let disc_max = d_subgroup[(d_subgroup.length - 1)]['CUM_%_DISC']

    prop_title.text(`${d_subgroup[0]['SYS_SCH']} by ${d_subgroup[0]['SUBGROUP_CATEGORY']}`);
    prop_legend_title.text(d_subgroup[0]['SUBGROUP_CATEGORY']);

    poly_1
      .attr('points', `${x0},${scooch}
          ${x1},${scooch}
          ${x1},${scooch + ((d_subgroup[0]['%_DISC_POP'] / disc_max) * plotHeight)}
          ${x0},${scooch + (d_subgroup[0]['%_OVERALL_POP'] / overall_max) * plotHeight}`)
      .attr('class', `${d_subgroup[0]['SUBGROUP_single']}`);
    legend_1
      .attr('class', `${d_subgroup[0]['SUBGROUP_single']}`)
      .attr('height', '15px')
      .attr('width', '15px')
      .attr('x', 475)
      .attr('y', scooch + 25)
    lab_1
      .attr('x', 495)
      .attr('y', scooch + 37)
      .text(d_subgroup[0]['SUBGROUP']);
    left_1
      .attr('x', x0 - 50)
      .attr('y', `${scooch + (d_subgroup[0]['CUM_%_OVERALL'] / overall_max) * plotHeight / 2}`)
      .text(`${format('.1f')(d_subgroup[0]['%_OVERALL_POP'])}%`);
    right_1
      .attr('x', 405)
      .attr('y', `${scooch + (d_subgroup[0]['CUM_%_DISC'] / disc_max) * plotHeight / 2}`)
      .text(`${format('.1f')(d_subgroup[0]['%_DISC_POP'])}%`);


    if (d_subgroup.length >= 2) {
      let i = 0
      poly_2
        .attr('points', `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / overall_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / overall_max) * plotHeight}`)
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .style('display', 'block');

      legend_2
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .attr('height', '15px')
        .attr('width', '15px')
        .attr('x', 475)
        .attr('y', scooch + (i * 20) + 45)
        .style('display', 'block');

      lab_2
        .attr('class', 'prop-label')
        .attr('x', 495)
        .attr('y', scooch + (i * 20) + 57)
        .text(d_subgroup[i + 1]['SUBGROUP'])
        .style('display', 'block');

      if (d_subgroup[i + 1]['%_OVERALL_POP'] > 2) {
        left_2
          .attr('class', 'prop-label')
          .attr('x', x0 - 50)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_OVERALL'] + +d_subgroup[i]['CUM_%_OVERALL']) / (2 * overall_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_OVERALL_POP'])}%`)
          .style('display', 'block');
      }

      if (d_subgroup[i + 1]['%_DISC_POP'] > 2) {
        right_2
          .attr('class', 'prop-label')
          .attr('x', 405)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_DISC'] + +d_subgroup[i]['CUM_%_DISC']) / (2 * disc_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_DISC_POP'])}%`)
          .style('display', 'block');
      }
    } else {
      poly_2.style('display', 'none')
      legend_2.style('display', 'none')
      lab_2.style('display', 'none')
      left_2.style('display', 'none')
      right_2.style('display', 'none')
    }

    if (d_subgroup.length >= 3) {
      let i = 1
      poly_3
        .attr('points', `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / overall_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / overall_max) * plotHeight}`)
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .style('display', 'block');

      legend_3
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .attr('height', '15px')
        .attr('width', '15px')
        .attr('x', 475)
        .attr('y', scooch + (i * 20) + 45)
        .style('display', 'block');

      lab_3
        .attr('class', 'prop-label')
        .attr('x', 495)
        .attr('y', scooch + (i * 20) + 57)
        .text(d_subgroup[i + 1]['SUBGROUP'])
        .style('display', 'block');

      if (d_subgroup[i + 1]['%_OVERALL_POP'] > 2) {
        left_3
          .attr('class', 'prop-label')
          .attr('x', x0 - 50)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_OVERALL'] + +d_subgroup[i]['CUM_%_OVERALL']) / (2 * overall_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_OVERALL_POP'])}%`)
          .style('display', 'block');
      }

      if (d_subgroup[i + 1]['%_DISC_POP'] > 2) {
        right_3
          .attr('class', 'prop-label')
          .attr('x', 405)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_DISC'] + +d_subgroup[i]['CUM_%_DISC']) / (2 * disc_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_DISC_POP'])}%`)
          .style('display', 'block');
      }
    } else {
      poly_3.style('display', 'none')
      legend_3.style('display', 'none')
      lab_3.style('display', 'none')
      left_3.style('display', 'none')
      right_3.style('display', 'none')
    }

    if (d_subgroup.length >= 4) {
      let i = 2
      poly_4
        .attr('points', `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / overall_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / overall_max) * plotHeight}`)
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .style('display', 'block');

      legend_4
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .attr('height', '15px')
        .attr('width', '15px')
        .attr('x', 475)
        .attr('y', scooch + (i * 20) + 45)
        .style('display', 'block');

      lab_4
        .attr('class', 'prop-label')
        .attr('x', 495)
        .attr('y', scooch + (i * 20) + 57)
        .text(d_subgroup[i + 1]['SUBGROUP'])
        .style('display', 'block');

      if (d_subgroup[i + 1]['%_OVERALL_POP'] > 2) {
        left_4
          .attr('class', 'prop-label')
          .attr('x', x0 - 50)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_OVERALL'] + +d_subgroup[i]['CUM_%_OVERALL']) / (2 * overall_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_OVERALL_POP'])}%`)
          .style('display', 'block');
      }
      if (d_subgroup[i + 1]['%_DISC_POP'] > 2) {
        right_4
          .attr('class', 'prop-label')
          .attr('x', 405)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_DISC'] + +d_subgroup[i]['CUM_%_DISC']) / (2 * disc_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_DISC_POP'])}%`)
          .style('display', 'block');
      }
    }
    else {
      poly_4.style('display', 'none')
      legend_4.style('display', 'none')
      lab_4.style('display', 'none')
      left_4.style('display', 'none')
      right_4.style('display', 'none')
    }

    if (d_subgroup.length >= 5) {
      let i = 3
      poly_5
        .attr('points', `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / overall_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / overall_max) * plotHeight}`)
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .style('display', 'block');

      legend_5
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .attr('height', '15px')
        .attr('width', '15px')
        .attr('x', 475)
        .attr('y', scooch + (i * 20) + 45)
        .style('display', 'block');

      lab_5
        .attr('class', 'prop-label')
        .attr('x', 495)
        .attr('y', scooch + (i * 20) + 57)
        .text(d_subgroup[i + 1]['SUBGROUP'])
        .style('display', 'block');

      if (d_subgroup[i + 1]['%_OVERALL_POP'] > 2) {
        left_5
          .attr('class', 'prop-label')
          .attr('x', x0 - 50)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_OVERALL'] + +d_subgroup[i]['CUM_%_OVERALL']) / (2 * overall_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_OVERALL_POP'])}%`)
          .style('display', 'block');
      }

      if (d_subgroup[i + 1]['%_DISC_POP'] > 2) {
        right_5
          .attr('class', 'prop-label')
          .attr('x', 405)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_DISC'] + +d_subgroup[i]['CUM_%_DISC']) / (2 * disc_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_DISC_POP'])}%`)
          .style('display', 'block');
      }
    }
    else {
      poly_5.style('display', 'none')
      legend_5.style('display', 'none')
      lab_5.style('display', 'none')
      left_5.style('display', 'none')
      right_5.style('display', 'none')
    }


    if (d_subgroup.length >= 6) {
      let i = 4
      console.log(d_subgroup[i + 1])
      poly_6
        .attr('points', `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / overall_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / overall_max) * plotHeight}`)
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .style('display', 'block');

      legend_6
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .attr('height', '15px')
        .attr('width', '15px')
        .attr('x', 475)
        .attr('y', scooch + (i * 20) + 45)
        .style('display', 'block');

      lab_6
        .attr('class', 'prop-label')
        .attr('x', 495)
        .attr('y', scooch + (i * 20) + 57)
        .text(d_subgroup[i + 1]['SUBGROUP'])
        .style('display', 'block');

      if (d_subgroup[i + 1]['%_OVERALL_POP'] > 2) {
        left_6
          .attr('class', 'prop-label')
          .attr('x', x0 - 50)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_OVERALL'] + +d_subgroup[i]['CUM_%_OVERALL']) / (2 * overall_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_OVERALL_POP'])}%`)
          .style('display', 'block');
      }

      if (d_subgroup[i + 1]['%_DISC_POP'] > 2) {
        right_6
          .attr('class', 'prop-label')
          .attr('x', 405)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_DISC'] + +d_subgroup[i]['CUM_%_DISC']) / (2 * disc_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_DISC_POP'])}%`)
          .style('display', 'block');
      }
    } else {
      poly_6.style('display', 'none')
      legend_6.style('display', 'none')
      lab_6.style('display', 'none')
      left_6.style('display', 'none')
      right_6.style('diplay', 'none')
    }

    if (d_subgroup.length >= 7) {
      let i = 5
      poly_7
        .attr('points', `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / overall_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / disc_max) * plotHeight}
              ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / overall_max) * plotHeight}`)
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .style('display', 'block');

      legend_7
        .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
        .attr('height', '15px')
        .attr('width', '15px')
        .attr('x', 475)
        .attr('y', scooch + (i * 20) + 45)
        .style('display', 'block');

      lab_7
        .attr('class', 'prop-label')
        .attr('x', 495)
        .attr('y', scooch + (i * 20) + 57)
        .text(d_subgroup[i + 1]['SUBGROUP'])
        .style('display', 'block');

      if (d_subgroup[i + 1]['%_OVERALL_POP'] > 2) {
        left_7
          .attr('class', 'prop-label')
          .attr('x', x0 - 50)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_OVERALL'] + +d_subgroup[i]['CUM_%_OVERALL']) / (2 * overall_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_OVERALL_POP'])}%`)
          .style('display', 'block');
      }

      if (d_subgroup[i + 1]['%_DISC_POP'] > 2) {
        right_7
          .attr('class', 'prop-label')
          .attr('x', 405)
          .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_DISC'] + +d_subgroup[i]['CUM_%_DISC']) / (2 * disc_max)) * plotHeight + 5}`)
          .text(`${format('.1f')(d_subgroup[i + 1]['%_DISC_POP'])}%`)
          .style('display', 'block');
      }
    } else {
      poly_7.style('display', 'none')
      legend_7.style('display', 'none')
      lab_7.style('display', 'none')
      left_7.style('display', 'none')
      right_7.style('display', 'none')
    }

    const note = "Groups not displayed have 0% student enrollment for the selected school system or school.Percentages are not shown for groups accounting for less than 2% for readability.The summary statement above reflects the group with the largest discrepancy between share of enrollment and share of disciplined population, whether under or overrepresented."
    if (d_subgroup[0]['SUBGROUP_CATEGORY'] === 'Race/Ethnicity') {
      const PPTS = d_subgroup.map(a => a['PPTS']);
      // https://stackoverflow.com/questions/11301438/return-index-of-greatest-value-in-an-array
      const idx = PPTS.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      overunder
        .text(`${d_subgroup[idx]['SUBGROUP']} students are ${d_subgroup[idx]['OVER/UNDER']} in the disciplined population relative to their share of enrollment by ${d_subgroup[idx]['PPTS']} percentage points.`);
      select('#right-bottom2')
        .attr('class', 'footnote')
        .text("Notes: The Governor's Office of Student Achievement discipline data includes the following Race/Ethnicity groups: American Indian or Alaskan Native, Asian, Black, Hispanic, Native Hawaiian or Other Pacific Islander, Two or More races, and White. " + note);
    }
    else {
      const ou = d_subgroup.map(a => a['OVER/UNDER']);
      const idx = ou.findIndex(x => x === 'overrepresented');
      select('#right-bottom2')
        .attr('class', 'footnote')
        .text("Notes: " + note)
      if (d_subgroup[idx]['SUBGROUP_CATEGORY'] === 'Disability Status') {
        overunder
          .text(`${d_subgroup[idx]['SUBGROUP']} are ${d_subgroup[idx]['OVER/UNDER']} in the disciplined population relative to their share of enrollment by ${d_subgroup[idx]['PPTS']} percentage points.`)
      }
      else {
        overunder.text(`${d_subgroup[idx]['SUBGROUP']} students are ${d_subgroup[idx]['OVER/UNDER']} in the disciplined population relative to their share of enrollment by ${d_subgroup[idx]['PPTS']} percentage points.`)
      }
    }
  }
  render()
}