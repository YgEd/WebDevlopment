

const dataSet = async function getData() {
    return await axios.get('/profile/analytics', {
        headers: {
          'X-Client-Side-Request': true
        }});
}
async function drawChart(value) {
const set_data = await dataSet();
if(set_data.data.e){
 return  res.json(set_data.data.e)
}
else{
let x_data = set_data.data.data
let y_data = set_data.data.data2
let x2_data = set_data.data.month_entries
let y2_data = set_data.data.array_val
let x3_data = set_data.data.shuffledMonths
let y3_data = set_data.data.shuffledcounter
const data = [{
  x: x_data,
  y: y_data,
  mode:"markers",
  type:"scatter"
}];

const data2 = [{
    x: x2_data,
    y: y2_data,
    mode:"markers",
    type:"scatter"
  }];

  const data3 = [{
    x: x3_data,
    y: y3_data,
    mode:"markers",
    type:"scatter"
  }];

const layout = {}

// Append SVG Object to the Page
Plotly.newPlot("gd", data, layout);
Plotly.newPlot("gd2", data2, layout);
Plotly.newPlot("gd3", data3, layout);
}
}



drawChart();