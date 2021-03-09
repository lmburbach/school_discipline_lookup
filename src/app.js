import { csv } from 'd3-fetch';
import { select } from 'd3-selection';
import { axisBottom } from 'd3-axis';
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

  const svg = select('#app')
    .append(svg)
    .attr('height', `${height}px`)
    .attr('width', `${width}px`)
    .append('g')
    .text('DROPDOWN BOXES GO HERE');

  // svg.append('g').attr('class', 'x-axis')

}
