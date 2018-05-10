var fill = d3.scaleOrdinal(d3.schemeCategory10); 

width = 850;
height = 550;



 d3.csv("data_cloud_plot.csv", function (cars) {
  cars.forEach(function(d) { 
      d.size = +d.size;
  });

  carsFiltered100 = [];
  cars.forEach(function(d) {
    if (d.size > 10) 
      carsFiltered100.push(d);
  })

  

  var grouped_cars = d3.nest()
      .key(function(d) {return d.producer})
      .entries(carsFiltered100)


  grouped_cars.forEach(function(obj) {
    obj.producer = obj.key;
    delete obj.key;

    obj.models = obj.values;
    delete obj.values;

    obj.size = d3.sum(obj.models, function(d) {return d.size});

  });


  buildCloudPlot(grouped_cars);


    function buildCloudPlot(grouped_cars) { 
      var carTop = d3.scaleLinear().range([15, 75]);
      
        carTop.domain([
          d3.min(grouped_cars, function(d) {return d.size;}),
          d3.max(grouped_cars, function(d) {return d.size;})
          ]);
      
        var layout = d3.layout.cloud()
        .size([width, height])
        .words(grouped_cars)
        .padding(5)
        .rotate(0)
        .text(function(d) { return d.producer; })
        .font("Open Sans")
        .fontSize(function(d) {return carTop(d.size); })
        .on("end", drawCloud);
      
        layout.start();
    
    
      function drawCloud(words) {
        d3.select("#cloudPlot").append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Open Sans")
            .style("fill", function(d,i) {  return fill(i);})
            .style("opacity", 1)
            .attr("text-anchor", "middle")
            .attr("class", "carTag")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.producer; });

        d3.selectAll(".carTag").on("click", function(d) {
          var name = d.producer;
          updateChart(name);
        });

        d3.select("#carProducerReturnTag").text(""); 

      }
   }

    window.updateChart = function(name) {
      d3.select("#cloudPlot svg")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove();

      var newCars;
      grouped_cars.forEach(function(d) {
        if (d.producer == name) 
          newCars = d.models;
      })

      // var newCarsFiltered10 = [];
      // newCars.forEach(function(d) {
      //   if (d.size > 25) 
      //     newCarsFiltered10.push(d);
      // })

      var carTop = d3.scaleLinear().range([15, 45]);
    
        carTop.domain([
          d3.min(newCars, function(d) {return d.size;}),
          d3.max(newCars, function(d) {return d.size;})
          ]);
    
        var layout = d3.layout.cloud()
        .size([width, height])
        .words(newCars)
        .padding(5)
        .rotate(0)
        .text(function(d) { return d.model; })
        .font("Open Sans")
        .fontSize(function(d) { return carTop(d.size); })
        .on("end", reDrawCloud);
      
        layout.start();
    
        function reDrawCloud(words) {
        d3.select("#cloudPlot").append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
              .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
              .data(words)
            .enter().append("text")
              .style("font-size", function(d) { return d.size + "px"; })
              .style("font-family", "Open Sans")
              .style("fill", function(d,i) {  return fill(i);})
              .attr("text-anchor", "middle")
              .attr("class", "modelTag")
              .transition()
              .duration(1000)
              .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
              })
              .text(function(d) { return d.model; });
        }

        d3.selectAll(".modelTag").on("click", function(d) {
          console.log(d.brand.replace(/\s+/g,' ').trim().toUpperCase())
          addCar(d.brand.replace(/\s+/g,' ').trim().toUpperCase());
        });

        d3.select("#carProducerReturnTag").text(name);



      }

    window.returnProducers = function() {
     d3.selectAll("#cloudPlot svg")
     .transition()
     .duration(1000)
     .style("opacity", 0)
     .remove() 
     buildCloudPlot(grouped_cars);

     //d3.select("#carProducerReturnTag").text("Список Виробників Автомобілів"); 
     
    };


});