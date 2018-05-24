

var sect = document.getElementById("inds");
var path = sect.options[sect.selectedIndex].value;
console.log(path);

var svg = d3.select("#bigLinePlot")
            .append("svg")
            .attr("width", "900")
            .attr("height", "600")


var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory1);


d3.csv(path, type, function(error, data) {
    debugger;


    
  if (error) throw error;

    fuel = data.columns.slice(1).map(function(id) {
    return {
      id: id.replace(/\s+/g,' '),
      values: data.map(function(d) {
        return {date: d.date, number: d[id]};
        })
      };
    });


    //Тут я створив змінну яка контролюватиме кількість елементів на графіку, відніматиме і додаватиме
    var fuelFiltered = [];
    fuel.forEach(function(d) {
        fuelFiltered.push(d.id);
    });



    //Довжина шкали Х
    var x = d3.scaleTime()
    .range([0, width]).domain(d3.extent(data, function(d) { return d.date; }));

    //Довжина шкали У
    var y = d3.scaleLinear()
      .range([height, 0])
      .domain([
      d3.min(fuel, function(c) { return d3.min(c.values, function(d) { return d.number; }); }),
      d3.max(fuel, function(c) { return d3.max(c.values, function(d) { return d.number; }); })
    ]);


    //Шкала кольорів
    var z = d3.scaleOrdinal(d3.schemeCategory1).domain(fuel.map(function(c) { return c.id; }));

    //Шкала Х
    g.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    //Шкала У    
    g.append("g")
        .attr("class", "axis y")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em");
        //.attr("fill", "#000");
      
    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.number); });

    //Створити лінії
    var car = g.selectAll(".car")
      .data(fuel, function(d) {return d.id})
      .enter()
      .append("g")
      .attr("class", "car")



   car.append("path")
      .attr("class", "fuel_line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); })
      .style("opacity", .5)
      .attr("id", function(d) { return d.id })
      .append("title") 
        .text(function(d) { return d.id });


    d3.select("#button").on("click", function(d) {

      //you are changing the global value here on change event.      
      var to_add = document.querySelectorAll("#the-basics input")[1].value;

      document.querySelectorAll("#the-basics input")[1].value = "";
      remakeLine(null,to_add);
    });

    d3.selectAll(".fuel_line").on("click", function(d) {

      //you are changing the global value here on change event.      
      var to_remove = d.id;
      remakeLine(to_remove, null);
    });



    function remakeLine(to_remove, to_add) {
    var carsOnClick = 0;

    debugger;
    if (to_add == null) 
        {
            fuelFiltered = fuelFiltered.filter(function (d) {return to_remove != d; })
        }
            console.log(fuelFiltered);
    if (to_remove == null) 
        {
            fuelFiltered.push(to_add);        
        }


    carsOnClick = fuel.filter(function (d) {return fuelFiltered.indexOf(d.id.replace(/\s+/g,' ')) > -1; })




      y.domain([
        0,
        d3.max(carsOnClick, function(c) { return d3.max(c.values, function(d) { return d.number; }); })
      ]);

      z.domain(carsOnClick.map(function(c) { return c.id; }));

      svg.select(".axis.x")
          .call(d3.axisBottom(x));
          
      //Update Y axis
      svg.select(".axis.y")
          .transition()
          .duration(1000)
          .call(d3.axisLeft(y));

      var carsUpd = g.selectAll("g.car")
          .data(carsOnClick, function(d){return d.id});
      

      var carsEnter = carsUpd.enter()
          .append("g")
          .attr("class", "car");
       
      carsEnter
          .append("path")
          .attr("class", "fuel_line")
          .style("opacity", .5)
          .append("title")
            .text(function(d) { return d.id });
      
      carsEnter.merge(carsUpd)
          .selectAll("path")
          .transition()
          .duration(1000)
          .attr("d", function(d) { return line(d.values) })
          .style("stroke", function(d) { return z(d.id) });

      carsUpd
        .exit()
        .remove();


    d3.selectAll(".fuel_line").on("click", function(d) {
    debugger;

      //you are changing the global value here on change event.      
      var to_remove = d.id;
      remakeLine(to_remove, null);
    });



    }

    // window.emptyLineChart = function() {
    //   currentCars = [];
    //   addCar();
    // }

    // window.deletePreviousLine = function() {
    //   currentCars.pop();
    //   addCar();
    //   console.log(currentCars);
    // }



    var substringMatcher = function(strs) {
      return function findMatches(q, cb) {
        var matches, substringRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(strs, function(i, str) {
          if (substrRegex.test(str)) {
            matches.push(str);
          }
        });

        cb(matches);
      };
    };

    var namesOfFuel = [];
    data.columns.slice(1).map(function(id) {return namesOfFuel.push(id)});
    debugger;

    $('#the-basics .typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'namesOfFuel',
      source: substringMatcher(namesOfFuel)
    });


    d3.select('#inds')
            .on("change", function () {
                sect = document.getElementById("inds");
                path = sect.options[sect.selectedIndex].value;

                remakeLine()

            });



});



var parseTime = d3.timeParse("%Y-%m");

function type(d, _, columns) {
    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
    }
