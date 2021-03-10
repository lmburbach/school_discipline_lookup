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
  const margin = { top: 10, left: 50, right: 10, bottom: 50 };

  // create svg element:
  const plotHeight = 500;
  const svg = select("#app")
    .append("svg")
    .attr("width", 500)
    .attr("height", plotHeight);

  const x0 = 100
  const x1 = 400

  // First Element
  svg.append('polygon')
    .attr('points', `${x0},0
        ${x1},0
        ${x1},${(d_subgroup[0]['%_DISC_POP'] / 100) * plotHeight}
        ${x0},${(d_subgroup[0]['%_OVERALL_POP'] / 100) * plotHeight}`)
    .attr('class', 'first');

  svg.append('text')
    .attr('x', 50)
    .attr('y', `${(d_subgroup[0]['CUM_%_OVERALL'] / 100) * plotHeight}`)
    .text(`${(d_subgroup[0]['%_OVERALL_POP'])}%`);

  svg.append('text')
    .attr('x', 405)
    .attr('y', `${(d_subgroup[0]['CUM_%_DISC'] / 100) * plotHeight}`)
    .text(`${(d_subgroup[0]['%_DISC_POP'])}%`);

  // Second element – ABSTRACT FROM HERE
  svg.append('polygon')
    .attr('points', `${x0},${(d_subgroup[0]['CUM_%_OVERALL'] / 100) * plotHeight}
    ${x1}, ${(d_subgroup[0]['CUM_%_DISC'] / 100) * plotHeight}
    ${x1}, ${(d_subgroup[1]['CUM_%_DISC'] / 100) * plotHeight}
    ${x0}, ${(d_subgroup[1]['CUM_%_OVERALL'] / 100) * plotHeight}`)
    .attr('class', 'second');

  svg.append('text')
    .attr('x', 50)
    .attr('y', `${(d_subgroup[1]['CUM_%_OVERALL'] / 100) * plotHeight}`)
    .text(`${(d_subgroup[1]['%_OVERALL_POP'])}%`);

  svg.append('text')
    .attr('x', 405)
    .attr('y', `${(d_subgroup[1]['CUM_%_DISC'] / 100) * plotHeight}`)
    .text(`${(d_subgroup[1]['%_DISC_POP'])}%`);

  // FOR SUBGROUP CATEGORY = RACE; add others
  const ordinalClasses = ['third', 'fourth', 'fifth', 'sixth', 'seventh']

  if (d_subgroup.length > 2) {
    for (let i = 0; i < ordinalClasses.length; i++) {
      if (d_subgroup[i + 2]['%_OVERALL_POP'] > 0) {
        svg.append('polygon')
          .attr('points', `${x0},${(d_subgroup[i + 1]['CUM_%_OVERALL'] / 100) * plotHeight}
        ${x1}, ${(d_subgroup[i + 1]['CUM_%_DISC'] / 100) * plotHeight}
        ${x1}, ${(d_subgroup[i + 2]['CUM_%_DISC'] / 100) * plotHeight}
        ${x0}, ${(d_subgroup[i + 2]['CUM_%_OVERALL'] / 100) * plotHeight}`)
          .attr('class', ordinalClasses[i]);

        svg.append('text')
          .attr('x', 50)
          .attr('y', `${(d_subgroup[i + 2]['CUM_%_OVERALL'] / 100) * plotHeight}`)
          .text(`${(d_subgroup[i + 2]['%_OVERALL_POP'])}%`);

        svg.append('text')
          .attr('x', 405)
          .attr('y', `${(d_subgroup[i + 2]['CUM_%_DISC'] / 100) * plotHeight}`)
          .text(`${(d_subgroup[i + 2]['%_DISC_POP'])}%`);
      }
    }
  }


  // ///WORKS BELOW
  // if (d_subgroup.length > 2) {
  //   if (d_subgroup[2]['%_OVERALL_POP'] > 0) {
  //     svg.append('polygon')
  //       .attr('points', `${x0},${(d_subgroup[1]['CUM_%_OVERALL'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[1]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[2]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x0}, ${(d_subgroup[2]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .attr('class', 'third');

  //     svg.append('text')
  //       .attr('x', 50)
  //       .attr('y', `${(d_subgroup[2]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[2]['%_OVERALL_POP'])}%`);

  //     svg.append('text')
  //       .attr('x', 405)
  //       .attr('y', `${(d_subgroup[2]['CUM_%_DISC'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[2]['%_DISC_POP'])}%`);
  //   }

  //   if (d_subgroup[3]['%_OVERALL_POP'] > 0) {
  //     svg.append('polygon')
  //       .attr('points', `${x0},${(d_subgroup[2]['CUM_%_OVERALL'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[2]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[3]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x0}, ${(d_subgroup[3]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .attr('class', 'fourth');

  //     svg.append('text')
  //       .attr('x', 50)
  //       .attr('y', `${(d_subgroup[3]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[3]['%_OVERALL_POP'])}%`);

  //     svg.append('text')
  //       .attr('x', 405)
  //       .attr('y', `${(d_subgroup[3]['CUM_%_DISC'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[3]['%_DISC_POP'])}%`);
  //   }

  //   if (d_subgroup[4]['%_OVERALL_POP'] > 0) {
  //     svg.append('polygon')
  //       .attr('points', `${x0},${(d_subgroup[3]['CUM_%_OVERALL'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[3]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[4]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x0}, ${(d_subgroup[4]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .attr('class', 'fifth');

  //     svg.append('text')
  //       .attr('x', 50)
  //       .attr('y', `${(d_subgroup[4]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[4]['%_OVERALL_POP'])}%`);

  //     svg.append('text')
  //       .attr('x', 405)
  //       .attr('y', `${(d_subgroup[4]['CUM_%_DISC'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[4]['%_DISC_POP'])}%`);
  //   }
  //   //idx 5 sixth
  //   if (d_subgroup[5]['%_OVERALL_POP'] > 0) {
  //     svg.append('polygon')
  //       .attr('points', `${x0},${(d_subgroup[4]['CUM_%_OVERALL'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[4]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[5]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x0}, ${(d_subgroup[5]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .attr('class', 'sixth');

  //     svg.append('text')
  //       .attr('x', 50)
  //       .attr('y', `${(d_subgroup[5]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[5]['%_OVERALL_POP'])}%`);

  //     svg.append('text')
  //       .attr('x', 405)
  //       .attr('y', `${(d_subgroup[5]['CUM_%_DISC'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[5]['%_DISC_POP'])}%`);
  //   }
  //   ///idx 6 = 7
  //   if (d_subgroup[6]['%_OVERALL_POP'] > 0) {
  //     svg.append('polygon')
  //       .attr('points', `${x0},${(d_subgroup[5]['CUM_%_OVERALL'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[5]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x1}, ${(d_subgroup[6]['CUM_%_DISC'] / 100) * plotHeight}
  //       ${x0}, ${(d_subgroup[6]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .attr('class', 'seventh');

  //     svg.append('text')
  //       .attr('x', 50)
  //       .attr('y', `${(d_subgroup[6]['CUM_%_OVERALL'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[6]['%_OVERALL_POP'])}%`);

  //     svg.append('text')
  //       .attr('x', 405)
  //       .attr('y', `${(d_subgroup[6]['CUM_%_DISC'] / 100) * plotHeight}`)
  //       .text(`${(d_subgroup[6]['%_DISC_POP'])}%`);
  //   }

}