
    var w = 500, h = 500;
    var margin = 20;
    var innerw = w - margin;
    var innerh = h - margin;
    var outergraph_translate_x = 60;
    var outergraph_translate_y = 30;
    var xScale;
    var yScale;
    var xScale2;
    var yScale2;
    var xScalebar;
    var yScalebar;
    var xAxis;
    var yAxis;
    var svgbarchart;
    var neighbourhoods = ["Queens", "Manhattan", "Brooklyn", "Bronx", "Staten Island"]
    var myColor = d3.scaleOrdinal().domain(neighbourhoods).range(d3.schemeCategory10);
    var grouped_bar_items;
    var items_to_update;
    var set_inside_brush;
    