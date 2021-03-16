import { csv } from 'd3-fetch';
import { select, transition } from 'd3-selection';
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

  // let temp_sys_sch = 'All School Systems – All Schools'; // change to all as default
  let temp_sys_sch = 'Appling County – All Schools';
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
  const margin = { top: 20, bottom: 20, left: 10, right: 10 },
    width = 450 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  const x_scale = scaleLinear().domain([0, 100]).range([0, width])
  const y_scale = scaleLinear().domain([0, 10]).range([17, 0])

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
      "translate(" + margin.left + "," + margin.top + ")");
  const enr_scale = enr
    .append('g')
    .attr("transform", "translate(0," + height / 2 + ")");  // UPTICK
  const enr_circles = enr.append('g');
  const enr_footnote = enr.append('text');

  // Students with Incidents

  const swi = select("#left-4")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
    ;

  // Incidents per student
  const ips = select("#left-5")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
    ;

  // State for Annual Trends Plot
  const trends_title = select('#left-title2');
  trends_title.append('chart-title')
    .attr('class', 'chart-title')
    .text('Annual Discipline Incidents by School Year');

  const l_height = 125 - margin.top - margin.bottom;

  const line_svg = select("#left-6")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", l_height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  let x_array = [2014, 2015, 2016, 2017]

  // STATE FOR PROPORTION PLOT
  const x0 = 60;
  const x1 = 400;
  const scooch = 50;
  const plotHeight = 475;
  const svg = select("#right-top")
    .append("svg")
    .attr("width", 800)
    .attr("height", 600);

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

  const overunder = select('#right-bottom');

  function render() {
    // Filter data based on user selection
    let d_subgroup = [];
    for (let i = 0; i < subgroup.length; i++) {
      if ((subgroup[i]['SYS_SCH_lookup'] === temp_sys_sch) && (subgroup[i]['SUBGROUP_CATEGORY'] === subgroup_selection)) { //ADD AND CONDITION
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


    //   //STUDENTS WITH INCIDENTS PERCENTILE PLOT (update tool tips, title parsing based on resolution to enrollment)
    //   swi.append('text')
    //     .attr('class', 'chart-title-small')
    //     .text(`
    //     Students with Incidents: ${format(',')(d_summary[0]['STUDENTS_WITH_INCIDENTS'])}
    //      (${format(',')(d_summary[0]['%_SWI'])}% of students)`);

    //   // TOTAL INCIDENTS PERCENTILE PLOT
    //   ips.append('text')
    //     .attr('class', 'chart-title-small')
    //     .text(`Total Incidents: ${format(',')(d_summary[0]['TOTAL_INCIDENTS'])} (${format(',')(d_summary[0]['INCIDENTS_PER_STUDENT'])} incidents per student)`);

    // ADD PERCENTILE GRAPH ONLY IF A SPECIFIC SCHOOL OR SYSTEM IS CHOSEN
    // select('CONTAINER_OF_ALL_OF_THOSE').style('display', 'block')
    if (sys_sch_selection != 'All School Systems – All Schools') {
      // select('CONTAINER_OF_ALL_OF_THOSE').style('display', 'none')
      enr_scale.call(axisBottom(x_scale)
        .ticks()
        .tickFormat(format('d'))
        .tickValues([0, 25, 50, 75, 100]));

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
        .on('mouseover', function mouseEnter(e) { //needs attention
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
        .text('Percentile ranking is charted above; hover for more details');

      //     // SWI PERCENTILE PLOT
      //     swi.append('g')
      //       .attr("transform", "translate(0," + height / 2 + ")")
      //       .call(axisBottom(x_scale)
      //         .ticks()
      //         .tickFormat(format('d'))
      //         .tickValues([0, 25, 50, 75, 100]));

      //     swi
      //       .append("g")
      //       .selectAll("dot")
      //       .data(d_summary)
      //       .enter()
      //       .append("circle")
      //       .attr("cx", x_scale(d_summary[0]['%_SWI_PCT']))
      //       .attr("cy", y_scale(1))
      //       .attr("r", 5)
      //       .attr("class", "pct-dot");

      //     ips.append('g')
      //       .attr("transform", "translate(0," + height / 2 + ")")
      //       .call(axisBottom(x_scale)
      //         .ticks()
      //         .tickFormat(format('d'))
      //         .tickValues([0, 25, 50, 75, 100]));

      //     ips
      //       .append("g")
      //       .selectAll("dot")
      //       .data(d_summary)
      //       .enter()
      //       .append("circle")
      //       .attr("cx", x_scale(d_summary[0]['INCIDENTS_PER_STUDENT_PCT']))
      //       .attr("cy", y_scale(1))
      //       .attr("r", 5)
      //       .attr("class", "pct-dot");

    }
    //   // ANNUAL TRENDS LINE GRAPH
    //   x_array = x_array.slice((4 - d_annual[0]['YEARS']), 4)
    //   let x = scaleLinear().domain([(min(x_array) - .5), (max(x_array) + .5)]).range([0, width])

    //   let y_arr = [d_annual[0]['2014'], d_annual[0]['2015'], d_annual[0]['2016'], d_annual[0]['2017']]
    //   y_arr = y_arr.slice((4 - d_annual[0]['YEARS']), 4)
    //   let y_array = y_arr.map((i) => Number(i));

    //   let ydim = [min(y_array), max(y_array)];

    //   let data = []
    //   for (let i = 0; i < x_array.length; i++) {
    //     let ob = { x: x_array[i], y: y_array[i] }
    //     data.push(ob)
    //   }

    //   line_svg.append('g')
    //     .attr("transform", "translate(0," + l_height + ")")
    //     .call(axisBottom(x)
    //       .ticks()
    //       .tickFormat(format('d'))
    //       .tickValues([2014, 2015, 2016, 2017]));

    //   let y = scaleLinear().domain([ydim[0] - 30, + ydim[1] + 10]).range([l_height, 0])

    //   line_svg.append("path")
    //     .datum(data)
    //     .attr("fill", "none")
    //     .attr("stroke", 'steelBlue')
    //     .attr("stroke-width", 2)
    //     .attr("d", line()
    //       .x(function (d) { return x(d.x) })
    //       .y(function (d) { return y(d.y) }));

    //   line_svg
    //     .append("g")
    //     .selectAll("dot")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", function (d) { return x(d.x) })
    //     .attr("cy", function (d) { return y(d.y) })
    //     .attr("r", 3)
    //     .attr("fill", "steelBlue");

    //   line_svg.selectAll("annotation")
    //     .append('g')
    //     .data(data)
    //     .enter()
    //     .append("text")
    //     .attr('class', 'annotation')
    //     .text(function (d) { return format(",")(d.y) })
    //     .attr('x', function (d) { return x(d.x) - 8 })
    //     .attr('y', function (d) { return y(d.y) + 12 });
    //   // come back to this if time: issue is bottom margin
    //   // .attr('y', function (d, i) {
    //   //   if (i < (data.length - 1)) {
    //   //     console.log(d, i)
    //   //     const offset = d.y > data[i + 1].y ? -15 : 15;
    //   //     return y(d.y + offset);
    //   //   }
    //   //   else {
    //   //     return y(d.y) + 15;
    //   //   }
    //   // });

    //   // PROPORTION PLOT
    //   let overall_max = d_subgroup[(d_subgroup.length - 1)]['CUM_%_OVERALL']
    //   let disc_max = d_subgroup[(d_subgroup.length - 1)]['CUM_%_DISC']

    //   svg.append('text')
    //     .data(d_subgroup)
    //     .attr('class', 'chart-title')
    //     .attr('x', 0)
    //     .attr('y', 15)
    //     // .text(`${d_subgroup[0]['SYS_SCH']} by ${d_subgroup[0]['SUBGROUP_CATEGORY']}`);
    //     .text(d => `${d['SYS_SCH']} by ${d['SUBGROUP_CATEGORY']}`);

    //   svg.append('text')
    //     .attr('class', 'legend-title')
    //     .attr('x', 475)
    //     .attr('y', scooch + 12)
    //     .text(d_subgroup[0]['SUBGROUP_CATEGORY']);

    //   svg.append('polygon')
    //     .attr('points', `${x0},${scooch}
    //       ${x1},${scooch}
    //       ${x1},${scooch + ((d_subgroup[0]['%_DISC_POP'] / disc_max) * plotHeight)}
    //       ${x0},${scooch + (d_subgroup[0]['%_OVERALL_POP'] / overall_max) * plotHeight}`)
    //     .attr('class', `${d_subgroup[0]['SUBGROUP_single']}`);

    //   svg.append('text')
    //     .attr('class', 'prop-label')
    //     .attr('x', x0 - 50)
    //     .attr('y', `${scooch + (d_subgroup[0]['CUM_%_OVERALL'] / overall_max) * plotHeight / 2}`)
    //     .text(`${format('.1f')(d_subgroup[0]['%_OVERALL_POP'])}%`);

    //   svg.append('text')
    //     .attr('class', 'prop-label')
    //     .attr('x', 405)
    //     .attr('y', `${scooch + (d_subgroup[0]['CUM_%_DISC'] / disc_max) * plotHeight / 2}`)
    //     .text(`${format('.1f')(d_subgroup[0]['%_DISC_POP'])}%`);

    //   svg.append('rect')
    //     .attr('class', `${d_subgroup[0]['SUBGROUP_single']}`)
    //     .attr('height', '15px')
    //     .attr('width', '15px')
    //     .attr('x', 475)
    //     .attr('y', scooch + 25)

    //   svg.append('text')
    //     .attr('class', 'prop-label')
    //     .attr('x', 495)
    //     .attr('y', scooch + 37)
    //     .text(d_subgroup[0]['SUBGROUP']);

    //   //redo this as more of a d3 element
    //   // svg.selectAll('polygon').data(d_subgroup).join('polygon').attr('points', (d, i) => {
    //   //   if (i === d_subgroup.length) {
    //   //     return '';
    //   //   }
    //   //   return `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / overall_max) * plotHeight}
    //   //       ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / disc_max) * plotHeight}
    //   //       ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / disc_max) * plotHeight}
    //   //       ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / overall_max) * plotHeight}`;
    //   // })
    //   for (let i = 0; i < (d_subgroup.length - 1); i++) {
    //     svg.append('polygon')
    //       .attr('points', `${x0},${scooch + (d_subgroup[i]['CUM_%_OVERALL'] / overall_max) * plotHeight}
    //         ${x1}, ${scooch + (d_subgroup[i]['CUM_%_DISC'] / disc_max) * plotHeight}
    //         ${x1}, ${scooch + (d_subgroup[i + 1]['CUM_%_DISC'] / disc_max) * plotHeight}
    //         ${x0}, ${scooch + (d_subgroup[i + 1]['CUM_%_OVERALL'] / overall_max) * plotHeight}`)
    //       .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`);

    //     svg.append('rect')
    //       .attr('class', `${d_subgroup[i + 1]['SUBGROUP_single']}`)
    //       .attr('height', '15px')
    //       .attr('width', '15px')
    //       .attr('x', 475)
    //       .attr('y', scooch + (i * 20) + 45);

    //     svg.append('text')
    //       .attr('class', 'prop-label')
    //       .attr('x', 495)
    //       .attr('y', scooch + (i * 20) + 57)
    //       .text(d_subgroup[i + 1]['SUBGROUP']);

    //     svg.append('text')
    //       .attr('class', 'chart-title-small')
    //       .attr('border-color', 'blue')
    //       .attr('border-weight', '2pt')
    //       .attr('x', 475)
    //       .attr('y', scooch + (i * 20) + 100)
    //       .text('Help me interpret this')
    //       .on('mouseover', function mouseEnter(e) { //not in the right position
    //         select(this)
    //         svg.append('text')
    //           .attr('id', 'help_hover')
    //           .attr('x', 475)
    //           .attr('y', scooch + (i * 20) + 125)
    //           .attr('class', 'tooltip')
    //           .text("This plot showcases the difference between a group's portion of the overall enrollment compared to the disciplined population. ");
    //       }).on('mouseout', function mouseEnter(e) {
    //         select(this)
    //         select('#help_hover').remove();
    //       });

    //     if (d_subgroup[i + 1]['%_OVERALL_POP'] > 2) {
    //       svg.append('text')
    //         .attr('class', 'prop-label')
    //         .attr('x', x0 - 50)
    //         .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_OVERALL'] + +d_subgroup[i]['CUM_%_OVERALL']) / (2 * overall_max)) * plotHeight + 5}`)
    //         .text(`${format('.1f')(d_subgroup[i + 1]['%_OVERALL_POP'])}%`);
    //     }

    //     if (d_subgroup[i + 1]['%_DISC_POP'] > 2) {
    //       svg.append('text')
    //         .attr('class', 'prop-label')
    //         .attr('x', 405)
    //         .attr('y', `${scooch + ((+d_subgroup[i + 1]['CUM_%_DISC'] + +d_subgroup[i]['CUM_%_DISC']) / (2 * disc_max)) * plotHeight + 5}`)
    //         .text(`${format('.1f')(d_subgroup[i + 1]['%_DISC_POP'])}%`);
    //     }
    //   }

    //   if (d_subgroup[0]['SUBGROUP_CATEGORY'] === 'Race/Ethnicity') {
    //     const PPTS = d_subgroup.map(a => a['PPTS']);
    //     // https://stackoverflow.com/questions/11301438/return-index-of-greatest-value-in-an-array
    //     const idx = PPTS.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    //     overunder.append('text')
    //       .text(`${d_subgroup[idx]['SUBGROUP']} students are ${d_subgroup[idx]['OVER/UNDER']} in the disciplined population relative to their share of enrollment by ${d_subgroup[idx]['PPTS']} percentage points.`);
    //     select('#right-bottom2')
    //       .attr('class', 'footnote')
    //       .text("Notes: The Governor's Office of Student Achievement discipline data includes the following Race/Ethnicity groups: American Indian or Alaskan Native, Asian, Black, Hispanic, Native Hawaiian or Other Pacific Islander, Two or More races, and White. Race/ethnicity groups not displayed have 0% student enrollment for the selected school system or school. Percentages are not shown for groups accounting for less than 2% for readability. The summary statement above reflects the group with the largest discrepancy between share of enrollment and share of disciplined population.");
    //   }
    //   else {
    //     const ou = d_subgroup.map(a => a['OVER/UNDER']);
    //     const idx = ou.findIndex(x => x === 'overrepresented');
    //     select('#right-bottom2')
    //       .attr('class', 'footnote')
    //       .text("Notes: Groups not displayed have 0% student enrollment for the selected school system or school. Percentages are not shown for groups accounting for less than 2% for readability. The summary statement above reflects the group with the largest discrepancy between share of enrollment and share of disciplined population.");
    //     if (d_subgroup[idx]['SUBGROUP_CATEGORY'] === 'Disability Status') {
    //       overunder.append('text')
    //         .text(`${d_subgroup[idx]['SUBGROUP']} are ${d_subgroup[idx]['OVER/UNDER']} in the disciplined population relative to their share of enrollment by ${d_subgroup[idx]['PPTS']} percentage points.`)
    //     }
    //     else {
    //       overunder.append('text').text(`${d_subgroup[idx]['SUBGROUP']} students are ${d_subgroup[idx]['OVER/UNDER']} in the disciplined population relative to their share of enrollment by ${d_subgroup[idx]['PPTS']} percentage points.`)
    //     }
    //   }
  }

  render()
}