function getMonthArray (min_month, max_month) {
    var min = new Date(min_month + "-01");
    var max = new Date(max_month + "-01");
    var result = [];
    var date = min;
    var year = date.getFullYear();
    var month = date.getMonth();
    while (true) {
        date = new Date(Date.UTC(year, month, 1));
        if (date > max) break;
        //result.push(date);
        //якщо треба не дати а рядок у форматі "2017-01" то 
        result.push(date.toISOString().slice(0,7));
        month++
    }
    return result;
};



var margin = {top: 8, right: 10, bottom: 2, left: 10},
    width = 960 - margin.left - margin.right,
    height = 69 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y-%m");

var x = d3.scaleTime()
    .range([0, width]);

d3.csv("data/small_multiples_10.csv", type, function(error, data) {

  if (error) throw error;

  var monthExtent = d3.extent(data.map(function(d) {return d.date}))
  var allMonth = getMonthArray(monthExtent[0], monthExtent[1]);

  var symbols = d3.nest()
      .key(function(d) { return d.symbol; })
      .entries(data);

  function addDates(arr) {
      var brand = arr.values
      var b = brand.map(function(d) {return d.date})

      var c = allMonth.filter(function(x){return !b.includes(x)});
      c.forEach(function(dd) {brand.push({symbol:arr.key, date:dd, size:0})})
      brand.sort(function(a,b) {return d3.ascending(a.date, b.date)});
  }; 

  symbols.forEach(function(brand) {
      addDates(brand); 
  })

  // Recursively sum up children's values
  function sumChildren(node) {
    if (node.value) {
      node.values = node.value;   // Ensure, leaf nodes will also have a values array
      delete node.value;          // ...instead of a single value
    }
    node.size = node.values.reduce(function(r, v) {
      return r + (v.value? sumChildren(v) : v.size);
    },0);
    return node.size;

   }


  // Loop through all top level nodes in nested data,
  // i.e. for all countries.
  symbols.forEach(function(node) {
    sumChildren(node);
  });

  console.log(symbols);


  x.domain([
    d3.min(symbols, function(symbol) { return parseDate(symbol.values[0].date); }),
    d3.max(symbols, function(symbol) { return parseDate(symbol.values[symbol.values.length - 1].date); })
  ]);

  var svg = d3.select("#smallMultiples").selectAll("svg")
      .data(symbols)
    .enter().append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .each(multiple);

  svg.append("text")
      .attr("x", width - 6)
      .attr("y", height - 5)
      .text(function(d) { return d.key; });
});

function multiple(symbol) {
  var svg = d3.select(this);

  var y = d3.scaleLinear()
      .domain([0, d3.max(symbol.values, function(d) { return d.price; })])
      .range([height, 0]);

  var area = d3.area()
      .curve(d3.curveStep)
      .x(function(d) { return x(parseDate(d.date)); })
      .y0(height)
      .y1(function(d) { return y(d.price); });

  var line = d3.line()
      .curve(d3.curveStep)
      .x(function(d) { return x(parseDate(d.date)); })
      .y(function(d) { return y(d.price); });

  svg.append("path")
      .attr("class", "area")
      .attr("d", area(symbol.values));

  svg.append("path")
      .attr("class", "line")
      .attr("d", line(symbol.values));
}

function type(d) {
  d.price = +d.price;
  //d.date = parseDate(d.date);
  return d;
}