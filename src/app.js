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

  // create data

  // create svg element:
  const svg = select("#app")
    .append("svg")
    .attr("width", 500)
    .attr("height", 500);

  // hard coding trapezoids for office hours
  const x0 = 100
  const x1 = 400

  svg.append('polygon')
    .attr('points', `${x0},0
    ${x1},0
    ${x1},${d_subgroup[0]['%_DISC_POP']}
    ${x0},${d_subgroup[0]['%_OVERALL_POP']}`);

  svg.append('text')
    .attr('x', 50)
    .attr('y', `${(d_subgroup[0]['%_OVERALL_POP']) / 2}`)
    .text(`${(d_subgroup[0]['%_OVERALL_POP'])}%`);

  svg.append('text')
    .attr('x', 405)
    .attr('y', `${(d_subgroup[0]['%_DISC_POP']) / 2}`)
    .text(`${(d_subgroup[0]['%_OVERALL_POP'])}%`);

  svg.append('polygon')
    .attr('points', `${x0},${d_subgroup[0]['%_OVERALL_POP']}
    ${x1}, ${d_subgroup[0]['%_DISC_POP']}
    ${x1}, ${d_subgroup[1]['CUM_%_DISC']}
    ${x0}, ${d_subgroup[1]['CUM_%_OVERALL']}`)
    .attr('fill', 'purple');

}


//   svg.append('g')
//     .selectAll('g')
//     .data(d_subgroup.columns)
//     .join('g')
//     .attr('transform', (d, i) => `translate(${ d(i) }, 20)`)
//     .call(g => g.append('text').text(d => d))
//     .call(g => g.append('line').attr('y1', 3).attr('y2', 9));
// }

  // for (let i of Array(d_subgroup.length - 1).keys()) {
  //   const x0 = 100;
  //   const x1 = 400;

  //   if (i === 0) {
  //     var ay = 0;
  //     var by = 0;
  //     var cy = d_subgroup[0]['%_DISC_POP'];
  //     var dy = d_subgroup[0]['%_OVERALL_POP'];

  //     svg.append('polygon')
  //       .attr('points', `${ x0 }, ${ ay } ${ x1 }, ${ by } ${ x1 }, ${ cy } ${ x0 }, ${ dy }`);

  //   }

  //   else {
  //     var ay = d_subgroup[i - 1]['%_DISC_POP'];
  //     var dy = d_subgroup[i - 1]['%_OVERALL_POP'];
  //     var cy = d_subgroup[i]['%_DISC_POP'];
  //     var dy = d_subgroup[i]['%_OVERALL_POP'];

  //     svg.append('polygon')
  //       .attr('points', `${ x0 }, ${ ay } ${ x1 }, ${ by } ${ x1 }, ${ cy } ${ x0 }, ${ dy }`);
  //   }



  // }



  // const svg = select('#app')
  //   .append(svg)
  //   .attr('height', `${ height }px`)
  //   .attr('width', `${ width }px`)
  //   .append('g')
  //   .attr("transform",
  //     "translate(" + margin.left + "," + margin.top + ")");

  // svg.append('path')
  //   .attr('d', area()
  //     .x0(0)
  //     .x1(0)
  //     .y1(61.4)
  //     .y2(41.8))

  // const test = d_subgroup[0]
  // console.log(test)
