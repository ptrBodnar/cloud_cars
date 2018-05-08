var fill = d3.scaleOrdinal(d3.schemeCategory10); 

width = 1300;
height = 600;



 d3.csv("data.csv", function (cars) {
  cars.forEach(function(d) { 
      d.size = +d.size;
  });

  //

  var grouped_cars = d3.nest()
      .key(function(d) {return d.producer})
      .entries(cars)


  grouped_cars.forEach(function(obj) {
    obj.producer = obj.key;
    delete obj.key;

    obj.models = obj.values;
    delete obj.values;

    obj.size = d3.sum(obj.models, function(d) {return d.size});
  });


  buildCloudPlot(grouped_cars);


    function buildCloudPlot(grouped_cars) { 
      var carTop = d3.scaleLinear().range([25, 75]);
      
        carTop.domain([
          d3.min(grouped_cars, function(d) {return d.size;}),
          d3.max(grouped_cars, function(d) {return d.size;})
          ]);
      
        var layout = d3.layout.cloud()
        .size([width, height])
        .words(grouped_cars)
        .padding(1)
        .rotate(function() { return ~~(Math.random() * 5) * -30 + 30; })
        .text(function(d) { return d.producer; })
        .font("Impact")
        .fontSize(function(d) { return carTop(d.size); })
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
            .style("font-family", "Impact")
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

        d3.select("#carProducerReturnTag").text("Список Виробників Автомобілів"); 

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

      var carTop = d3.scaleLinear().range([25, 75]);
    
        carTop.domain([
          d3.min(newCars, function(d) {return d.size;}),
          d3.max(newCars, function(d) {return d.size;})
          ]);
    
        var layout = d3.layout.cloud()
        .size([width, height])
        .words(newCars)
        .padding(1)
        .rotate(function() { return ~~(Math.random() * 5) * -30 + 30; })
        .text(function(d) { return d.model; })
        .font("Impact")
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
              .style("font-family", "Impact")
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
          addCar(d.producer + " " + d.model);
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

     d3.select("#carProducerReturnTag").text("Список Виробників Автомобілів"); 
     
    };


});