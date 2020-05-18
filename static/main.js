    svg = d3.select("#map").append("svg").attr("width", w).attr("height", h).append("g")
                .attr("id","outergraph")
                .attr("transform", "translate(" + outergraph_translate_x + "," + outergraph_translate_y + ")");
    
    var brush = d3.brush()
        .on("start", brushstart)
        .on("brush", brushmove)
        .on("end", brushend);

    var brush2 = d3.brush()
        .on("start", brushstart2)
        .on("brush", brushmove2)
        .on("end", brushend);

    var brush3 = d3.brush()
        .on("start", brushstart3)
        .on("brush", brushmove3)
        .on("end", brushend);

    var brushCell;
    var brushCell2;
    var brushCell3;
    var inside_brush;

    function checkConditions(e,d,type){
        
        if(type==="map"){                    
            var map_check = true;
            var cx = projection([+d.longitude, +d.latitude])[0];
                        cy = projection([+d.longitude, +d.latitude])[1];
            if( !(e[0][0] > cx || cx > e[1][0]
                || e[0][1] > cy || cy > e[1][1])){
                    inside_brush.push(+d.index);
                    map_check = false;
                }
                return map_check;
            
        }
        if(type === "pricescatter") {
        var scatter_price_zri_check = true;
        var cx = xScale(d[0]);
                           cy =  yScale(d[1]);
            if( !(e[0][0] > cx || cx > e[1][0]
                || e[0][1] > cy || cy > e[1][1])){
                    inside_brush.push(+d[2]);
                    scatter_price_zri_check = false;
                }
            return scatter_price_zri_check;
        
         }
        if(type === "pcascatter") {
        var pca_scatter_check = true;
        var cx = xScale2(d[0]);
                           cy =  yScale2(d[1]);
            if( !(e[0][0] > cx || cx > e[1][0]
                || e[0][1] > cy || cy > e[1][1])){
                    inside_brush.push(+d[2]);
                    pca_scatter_check = false;
                }
            return pca_scatter_check;
        
         }


     return true;   
    }

    // Clear the previously-active brush, if any.
    function brushstart(p) {
        console.log("inside brush start");
        inside_brush = [];
        set_inside_brush = [];
        // restore original bar
        // TO DO: Remove slicing from here once flask API is implemented
        console.log(grouped_bar_items);
        orig_items = grouped_bar_items.slice(0,11)
        update(orig_items);
    if (brushCell !== this) {
        d3.select(brushCell).call(brush.move, null);
        
        brushCell = this;
        }
    }

    function brushstart2(p) {
        console.log("inside brush start");
        inside_brush = [];
        set_inside_brush = [];
        // TO DO: Remove slicing from here once flask API is implemented
        orig_items = grouped_bar_items.slice(0,11)
        update(orig_items);
    if (brushCell2 !== this) {
        d3.select(brushCell2).call(brush2.move, null);
        brushCell2 = this;
        }
    }

    function brushstart3(p) {
        console.log("inside brush start");
        inside_brush = [];
        set_inside_brush = [];
        // TO DO: Remove slicing from here once flask API is implemented
        orig_items = grouped_bar_items.slice(0,11)
        update(orig_items);
    if (brushCell3 !== this) {
        d3.select(brushCell3).call(brush3.move, null);
        brushCell3 = this;
        }
    }
    
    var brushed_area;
    // Highlight the selected circles.
    function brushmove(p) {
        inside_brush = []
        brushed_area = "map";
        var e = d3.brushSelection(this);
        d3.select("body").selectAll("#mapscatter").classed("hidden", function(d) {
            // to return default true, checkConditions should return false
            var to_return = checkConditions(e,d,"map");
            return !e? false: to_return;
        });
        set_inside_brush = new Set(inside_brush)
        linkedBrush(brushed_area,set_inside_brush);
    }

    function brushmove2(p) {
        inside_brush = []
        var e = d3.brushSelection(this);
        brushed_area = "pricescatter"
        d3.select("body").selectAll("#pricescatter").classed("hidden", function(d) {
            var to_return = checkConditions(e,d,"pricescatter");
            return !e? false: to_return;
        });
        set_inside_brush = new Set(inside_brush)
        linkedBrush(brushed_area,set_inside_brush);
    }

    function brushmove3(p) {
        inside_brush = []
        var e = d3.brushSelection(this);
        brushed_area = "pcascatter"
        d3.select("body").selectAll("#pcascatter").classed("hidden", function(d) {
            var to_return = checkConditions(e,d,"pcascatter");
            return !e? false: to_return;
        });
        set_inside_brush = new Set(inside_brush)
        linkedBrush(brushed_area,set_inside_brush);
    }

    function linkedBrush(type,set_inside_brush){
        if(type === "map"){
                d3.select("body").selectAll("#pricescatter").classed("hidden", function(d) {
                    if(set_inside_brush.has(+d[2])){
                    return false;
                    }
                    else{
                        return true;
                    }
                });
                d3.select("body").selectAll("#pcascatter").classed("hidden", function(d) {
                    if(set_inside_brush.has(+d[2])){
                    return false;
                    }
                    else{
                        return true;
                    }
                });
        }
        if(type === "pricescatter"){
            d3.select("body").selectAll("#mapscatter").classed("hidden", function(d) {
                if(set_inside_brush.has(+d.index)){
                    return false;
                    }
                    else{
                        return true;
                    }
            });
            d3.select("body").selectAll("#pcascatter").classed("hidden", function(d) {
                    if(set_inside_brush.has(+d[2])){
                    return false;
                    }
                    else{
                        return true;
                    }
                });
        }
        if(type === "pcascatter"){
            d3.select("body").selectAll("#mapscatter").classed("hidden", function(d) {
                if(set_inside_brush.has(+d.index)){
                    return false;
                    }
                    else{
                        return true;
                    }
            });
            d3.select("body").selectAll("#pricescatter").classed("hidden", function(d) {
                    if(set_inside_brush.has(+d[2])){
                    return false;
                    }
                    else{
                        return true;
                    }
                });
        }

        // TO DO: FLASK API call here, result should go in random_items_to_update
        // Take input to API as set_inside_brush, which has the index of all the rows inside the brushed area
        
        // console.log(items_to_update)
        

    }
    // If the brush is empty, select all circles.
    function brushend() {
    console.log("inside brush end");
    var e = d3.brushSelection(this);
    jsonified_set = JSON.stringify(Array.from(set_inside_brush));
    if(set_inside_brush.size > 0){
    $.get("/barcrime/"+jsonified_set, function(result){
            result = JSON.parse(result);
            // console.log(result);
            items_to_update = result;
            console.log(items_to_update);
            update(items_to_update);
        });
    }
    if (e === null) d3.select("body").selectAll(".hidden").classed("hidden", false);
    }

    var projection = d3.geoMercator() // mercator makes it easy to center on specific lat/long
        .scale(45000)
        .center([-73.623560,40.652308]);// long, lat of NYC

    var pathGenerator = d3.geoPath()
        .projection(projection);

    $.get("/geodata", function(boroughs){
    // d3.json("nyc.geo.json", function(error, boroughs) {
    //     if (error) return console.error(error);
        //console.log(boroughs);
        svg.selectAll("path")
            .data(boroughs.features)
          .enter().append("path")
            .attr("class", "boroughs")
            .attr("d", pathGenerator);

        // With map made, load data and add it to the map
        // TO DO: Flask API call here, load data from flask
        // We need PC1 and PC2 columns in the dataset for PCA
        // $.get("/pcadataset", function(airbnbdata){

        $.get("/map", function(airbnbdata){
            airbnbdata = JSON.parse(airbnbdata);

            addPointsToMap(airbnbdata);
        });

        $.get("/pricescatter", function(airbnbdata){
            airbnbdata = JSON.parse(airbnbdata);
            drawScatterPlot(airbnbdata,"Price/Night","Rating","pricescatter");
        });

        $.get("/pcascatter", function(airbnbdata){
            airbnbdata = JSON.parse(airbnbdata);
            drawScatterPlot(airbnbdata,"PC1","PC2","pcascatter");
        });

        $.get("/barcrime/all", function(result){
            result = JSON.parse(result);
            grouped_bar_items = result;
            drawBarChart(result);
        });
            
        });
    
    var addPointsToMap = function(airbnbdata) {
        var radiusScale = d3.scaleSqrt()
            // .domain([d3.extent(crimeData, function(crime) { return +crime.TOT; })])
            .domain([1,5])
            .range([2, 15]);

        drawLegend(neighbourhoods);
        all_circles = svg.selectAll("circle")
            .data(airbnbdata)
          .enter().append("circle")
            .attr("fill", function(d) { return myColor(d.neighbourhood_group) })
            .attr("cx", function(d) { return projection([+d.longitude, +d.latitude])[0]; })
            .attr("cy", function(d) { return projection([+d.longitude, +d.latitude])[1]; })
            .attr("id","mapscatter")
            .attr("idx",function(d){ return +d.index})
            .attr("r",  function(d) { return 2 });

        svg.append("g")
            .call(brush);
    };
    
    var drawScatterPlot = function(dataset,x_lab,y_lab,type){
    var x_label=x_lab,y_label=y_lab;

   
    var w = 400,
        h = 300;
    var margin = 70;
    var innerw = w - margin;
    var innerh = h - margin;
    var outergraph_translate_x = 40;
    var outergraph_translate_y = 10;
    
    if(type === "pricescatter"){
    final_ds = dataset.map(function(d) { return [+d.price,+d.review_scores_rating,+d.index,d.neighbourhood_group]; })
    }
    if(type === "pcascatter"){
    // TO DO: Flask API call, don't call the API here, just rename
    // Rename price_zscore to PC1 and crime_zscore to PC2
    final_ds = dataset.map(function(d) { return [+d.PC1,+d.PC2,+d.index,d.neighbourhood_group]; })
    }
    var buffer = 2;
    // final_ds = dataset.original.circle.concat(dataset.stratified.circle,dataset.random.circle)
    x_lim = d3.extent(final_ds, d => d[0])
    y_lim = d3.extent(final_ds, d => d[1])

    if(type === "pricescatter"){
    xScale = d3.scaleLinear().range([0, innerw]).domain([x_lim[0]-buffer-10, x_lim[1]+buffer]);
    yScale = d3.scaleLinear().range([innerh, 0]).domain([y_lim[0]-buffer, y_lim[1]+buffer]);
    }
    if(type === "pcascatter"){
    buffer = 0.1
    xScale2 = d3.scaleLinear().range([0, innerw]).domain([x_lim[0]-buffer, x_lim[1]+buffer]);
    yScale2 = d3.scaleLinear().range([innerh, 0]).domain([y_lim[0]-buffer, y_lim[1]+buffer]);
    }
    // clearGraph();
    
    var svg2 = d3.select("#"+type+"div").append("svg").attr("width", w).attr("height", h)
                .append("g")
                .attr("id",type+"divid")
                .attr("transform", "translate(" + outergraph_translate_x + "," + outergraph_translate_y + ")");
    
    var g = d3.select("#"+type+"divid")

    // Build X-Axis
    if(type === "pricescatter"){
    var x_axis_label = g.append("g")
        .attr("transform", "translate(0," + innerh + ")")
        .transition()
        .duration(500)
        .call(d3.axisBottom(xScale))
        .attr("font-weight", "bold");

    g.append("g")
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale))
        .attr("font-weight", "bold")
    }
    if(type === "pcascatter"){
        var x_axis_label = g.append("g")
        .attr("transform", "translate(0," + innerh + ")")
        .transition()
        .duration(500)
        .call(d3.axisBottom(xScale2))
        .attr("font-weight", "bold");
    
    g.append("g")
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale2))
        .attr("font-weight", "bold")
    }
    // Build Y-Axis
    
    // Draw X Axis label
    g.append("text")
        .transition()
        .duration(500)
        .attr("y", innerh + 40)
        .attr("x", innerw - 10)
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text(x_label);

    // Draw Y Axis label
    g.append("text")
        .transition()
        .duration(500)
        .attr("transform", "rotate(-90)")
        .attr("dy", "-30px")
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text(y_label);

    // drawLegend()

    g.append('g')
        .selectAll("circle")
        .data(final_ds)
        .enter()
        .append("circle")
        .transition()
        .duration(500)
        .attr("cx", function (d) { 
            if(type === "pricescatter"){
                return xScale(d[0]); 
            }
            if(type === "pcascatter"){
                return xScale2(d[0]); 
            }
        } )
        .attr("cy", function (d) { 
            if(type === "pricescatter"){
                return yScale(d[1]); 
            }
            if(type === "pcascatter"){
                return yScale2(d[1]); 
            }
        } )
        .attr("r", 2)
        .attr("id",type)
        .attr("idx",function(d){ return d[2]})
        .style("fill", function(d){ return myColor(d[3]);});
    
    if(type === "pricescatter"){
    svg2.append('g').call(brush2);
    }
    if(type === "pcascatter"){
    svg2.append('g').call(brush3);
    }
    };


    var drawBarChart = function(dataset){

        var data1 = dataset;

            var w = 800,
                h = 300;
            var margin = 70;
            var innerw = w - margin;
            innerhbar = h - margin;
            var outergraph_translate_x = 60;
            var outergraph_translate_y = 10;

            svgbarchart = d3.select("#barchartdiv")
                .append("svg").attr("width", w).attr("height", h).append("g")
                .attr("id","outergraphbarchart")
                .attr("transform", "translate(" + outergraph_translate_x + "," + outergraph_translate_y + ")");
  

            // Initialize the X axis
            xScalebar = d3.scaleBand()
            .range([ 0, innerw ])
            .padding(0.2);
            xAxis = svgbarchart.append("g")
            .attr("transform", "translate(0," + innerhbar + ")")

            // Initialize the Y axis
            yScalebar = d3.scaleLinear()
            .range([innerhbar, 0]);

            yAxis = svgbarchart.append("g")
            .attr("class", "myYaxis")

            svgbarchart.append("text")
                .transition()
                .duration(500)
                .attr("y", innerhbar + 40)
                .attr("x", innerw - 10)
                .attr("text-anchor", "end")
                .attr("font-weight", "bold")
                .text("2019 months");

            // Draw Y Axis label
            svgbarchart.append("text")
                .transition()
                .duration(500)
                .attr("transform", "rotate(-90)")
                .attr("dy", "-50px")
                .attr("text-anchor", "end")
                .attr("font-weight", "bold")
                .text("Number of Crimes");
            
            xScalebar.domain(data1.map(function(d) { return d.group; }))
            xAxis.call(d3.axisBottom(xScalebar)).attr("font-weight", "bold");

            // Update the Y axis
            yScalebar.domain([0, d3.max(data1, function(d) { return d.value }) ]);
            yAxis.transition().duration(1000).call(d3.axisLeft(yScalebar)).attr("font-weight", "bold");
            // Initialize the plot with the dataset passed
            update(data1)

    }

            // A function that create / update the plot for a given variable:
            function update(data) {
            // Update the X axis
            // xScalebar.domain(data.map(function(d) { return d.group; }))
            // xAxis.call(d3.axisBottom(xScalebar)).attr("font-weight", "bold");

            // // Update the Y axis
            // yScalebar.domain([0, d3.max(data, function(d) { return d.value }) ]);
            // yAxis.transition().duration(1000).call(d3.axisLeft(yScalebar)).attr("font-weight", "bold");

            // Create the u variable
            var u = svgbarchart.selectAll("rect")
                .data(data)

            u.enter()
                .append("rect") // Add a new rect for each new elements
                .merge(u) // get the already existing elements as well
                .transition() // and apply changes to all of them
                .duration(1000)
                .attr("x", function(d) { return xScalebar(d.group); })
                .attr("y", function(d) { return yScalebar(d.value); })
                .attr("width", xScalebar.bandwidth())
                .attr("height", function(d) { return innerhbar - yScalebar(d.value); })
                .attr("fill", "#FF385C")

            // If less group in the new dataset, I delete the ones not in use anymore
            u
                .exit()
                .remove()
            }


    function drawLegend(neighbourhoods){
    
    console.log(neighbourhoods);
    var legend = d3.select("#outergraph").selectAll(".legend").raise()
        .data(neighbourhoods)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(-520," + i * 20 + ")"; });
    
    legend.raise().append("rect")
        .attr("x", innerw - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d){return myColor(d);});

    legend.append("text")
        .attr("x", innerw + 10)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; })
        .style("stroke","black");

};
    