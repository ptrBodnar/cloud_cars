var sect = document.getElementById("inds");
var path = sect.options[sect.selectedIndex].value;

window.namesOfFuel = [];

plotting(path);

$('#the-basics .typeahead').typeahead({
              hint: true,
              highlight: true,
              minLength: 1
            },
            {
              name: 'namesOfFuel',
              source: substringMatcher(namesOfFuel)
            });





window.change = function(value) {
    if (value == "data/oblast_name_brand_line_plot_long.csv")
    	{
        d3.selectAll(".legend").remove();  
    		changeOblastBrand(value);
    		emptyArray(namesOfFuel);
    	}
    else
    	{	

    		if (document.querySelector("#mySelect") != null)
    		{
    			document.querySelector("#mySelect").remove();
          d3.selectAll(".legend").remove();          
    			plotting(value);
    		}
    		else
          d3.selectAll(".legend").remove();          
    			plotting(value);
    	}

}



function plotting(path) {

		d3.select("#bigLinePlot svg").remove();

		var svg = d3.select("#bigLinePlot")
		            .append("svg")
		            .attr("width", "900")
		            .attr("height", "580")


		var margin = {top: 20, right: 80, bottom: 30, left: 50},
		    width = svg.attr("width") - margin.left - margin.right,
		    height = svg.attr("height") - margin.top - margin.bottom,
		    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		var x = d3.scaleTime().range([0, width]),
		    y = d3.scaleLinear().range([height, 0]);

		if (path == "data/oblast_name_brand_line_plot_long.csv")
		{
			changeOblastBrand(path);
		}

		else

        d3.csv(path, type, function(error, data) {

        emptyArray(namesOfFuel);

        data.columns.slice(1).map(function(id) { namesOfFuel.push(id)});


            
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
        var z = d3.scaleOrdinal(["#008D9E"]).domain(fuel.map(function(c) { return c.id; }));

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
          .style("z-index", 0.5)
          .append("title") 
            .text(function(d) { return d.id });

         
         // add legend   

         //ЖАЛЮГІДНІ СПРОБИ ЗРОБИТИ ЛЕГЕНДУ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


         // var ordinal = d3.scaleOrdinal()
         //   .domain(fuel.map(function(d) {return d.id;}).sort())
         //   .range(d3.schemePaired);
         var n = fuel.map(function(d){return d.id;}).length/1.5;
         var itemWidth =25;
         var itemHeight = 170;

         var svgLegend = d3.select("#legend svg");

         var button = d3.select("#legend");

         button = document.createElement("button");

          var legend = svgLegend.selectAll(".legend")
            .data(fuel)
            .enter()
            .append("g")
            .attr("transform", function(d,i) { return "translate(" +  Math.floor(i/n) * itemHeight  + "," + i%n * itemWidth + ")"; })
            .attr("class","legend")
            .style("opacity", 1);
            
          var rects = legend.append('rect').attr("class","rect")
            .attr("width",15)
            .attr("height",15)
            .attr("fill", function(d,i) { return z(d.id); });
            
          var text = legend.append('text')
            .attr("x", 18)
            .attr("y",12)
            .text(function(d) { return d.id; });

          legend.on("click", function(d) {
          debugger;
            if (this.style.opacity == 1) {
              var to_remove = document.getElementById(d.id).id;
              remakeLine(to_remove, null);
              this.style.opacity = 0.1;
            }
            else
            {
              var to_add = d.id;
              remakeLine(null,to_add);
              this.style.opacity = 1;
            }
          })

          legend.on("mouseover", function(d) {
            debugger;
            d3.selectAll(".fuel_line")._groups[0].forEach(function(d) {d.style.opacity = 0.1})
            document.getElementById(d.id).style.opacity = 1;
          })
          .on("mouseout", function(d) {
            d3.selectAll(".fuel_line")._groups[0].forEach(function(d) {d.style.opacity = 0.5}) 
          })

          d3.select("#deleteBigLinePlot").on("click", function(){
            remakeLine(null, null);
            //applying opacity to the legend to mark that the lines were deleted. It will allow to rename them later.
            var myCollection = document.getElementsByClassName("legend");
            var i;
            for (i = 0; i < myCollection.length; i++) {
                myCollection[i].style.opacity = 0.5;
            }
          });



    
        // d3.select("#button").on("click", function(d) {

        //   //you are changing the global value here on change event.      
        //   var to_add = document.querySelectorAll("#the-basics input")[1].value;

        //   document.querySelectorAll("#the-basics input")[1].value = "";
        //   remakeLine(null,to_add);
        // });

        // d3.selectAll(".fuel_line").on("click", function(d) {

        //   //you are changing the global value here on change event.      
        //   var to_remove = d.id;
        //   remakeLine(to_remove, null);
        //   document.getElementById(d.id).style.opacity = 0.5;
        // });

            window.remakeLine = function(to_remove, to_add) {
            var carsOnClick = 0;

            if (to_add == null) 
                {
                    fuelFiltered = fuelFiltered.filter(function (d) {return to_remove != d; })
                }
            if (to_remove == null) 
                {
                    fuelFiltered.push(to_add);        
                }
            if (to_remove == null & to_add == null)
                {
                    emptyArray(fuelFiltered);
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
              debugger;
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
                  .attr("id", function(d) { return d.id })
                  .style("z-index", "0.5")
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


            // d3.selectAll(".fuel_line").on("click", function(d) {

            //   //you are changing the global value here on change event.      
            //   var to_remove = d.id;
            //   remakeLine(to_remove, null);
            //   document.getElementById(d.id).style.opacity = 0.5;

            // });


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

        });
    

}



function type(d, _, columns) {
    var parseTime = d3.timeParse("%Y-%m");

    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
    }

function substringMatcher(strs) {
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

function emptyArray(arr) {
	arr.splice(0, arr.length);
}