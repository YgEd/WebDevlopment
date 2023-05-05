const dataSet = async function getData() {
    return await axios.get('/profile/analytics');
}
async function drawChart() {
const set_data = await dataSet();
let x_data = set_data.data.data
let y_data = set_data.data.data2
const data = [{
  x: x_data,
  y: y_data,
  mode:"markers",
  type:"scatter"
}];

const layout = {}

// Append SVG Object to the Page
Plotly.newPlot("gd", data, layout);
```
const svg = d3.select("#myPlot")
  .append("svg")
  .append("g")
  .attr("transform","translate(" + margin + "," + margin + ")");

// X Axis
const x = d3.scaleLinear()
  .domain([0, 500])
  .range([0, xMax]);

svg.append("g")
  .attr("transform", "translate(0," + yMax + ")")
  .call(d3.axisBottom(x));

// Y Axis
const y = d3.scaleLinear()
  .domain([0, 500])
  .range([ yMax, 0]);

svg.append("g")
  .call(d3.axisLeft(y));

// Dots
svg.append('g')
  .selectAll("dot")
  .data(data).enter()
  .append("circle")
  .attr("cx", function (d) { return d[0] } )
  .attr("cy", function (d) { return d[1] } )
  .attr("r", 3)
  .style("fill", "Red");```
}
drawChart();