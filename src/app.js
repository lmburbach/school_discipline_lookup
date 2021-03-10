import { csv } from 'd3-fetch';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { line, polygon, stack } from 'd3-shape';
import './main.css';

Promise.all([
  csv('./data/tiny_summary.csv'),
  csv('./data/tiny_annual_incidents.csv'),
  csv('./data/tiny_discipline_by_subgroup.csv')
]).then(myVis)
  .catch(error => { console.log(error) });

function myVis(results) {
  const [d_summary, d_annual, d_subgroup] = results;
  const width = 5000;
  const height = (36 / 24) * width;
  const margin = { top: 20, left: 50, right: 10, bottom: 50 };

  //LINE GRAPH
  const line_svg = select("#app")


  // // PROPORTION PLOT – WORKS; HOW TO ORGANIZE
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