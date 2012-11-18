whitburn.Views.ScatterPlot = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/scatterplot.ejs'}),

  initialize: function() {
    _.bindAll(this, 'render', 'renderPlot');

    this.model.bind('change:param_x', this.render);
    this.model.bind('change:param_y', this.render);
  },

  render: function() {
    this.$el.html(this.template.render());

    // Create D3 scatterplot
    this.renderPlot();

    return this.$el;
  },

  renderPlot: function() {
    var param_x = this.model.get('param_x') || 'year',
        param_y = this.model.get('param_y') || 'song_hotttnesss';

    var containerHeight = this.$el.height();
        containerWidth = this.$el.width();

    // Dimensions
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    // X-scale
    var x = d3.time.scale()
              .range([0, width]);

    // Y-scale
    var y = d3.scale.linear()
              .range([height, 0]);

    // Color scale
    var color = d3.scale.linear().range(["blue", "red"]);

    // Size
    var size = d3.scale.linear().range([5, 15]);

    // X-axis
    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom");

    // Y-axis
    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient("left");

    // SVG
    var svg = d3.select('.scatterplot').append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Loop through data
    var data = [];
    this.collection.each(function(track) {
      //console.log('x', track.get('audio_summary'));
      var hotness = track.get('song_hotttnesss'),
          summary = track.get('audio_summary');
      if (!hotness) return;
      var x = (param_x.indexOf('summary.') !== -1) ? summary[param_x.split('summary.')[1]] : track.get(param_x),
          y = (param_y.indexOf('summary.') !== -1) ? summary[param_y.split('summary.')[1]] : track.get(param_y);

      data.push({
        x: x,
        y: y,
        size: summary.duration,
        color: track.get('song_hotttnesss'),
        name: track.get('name')
      });
    });

    x.domain(d3.extent(data, function(d) { return d.x; })).nice();
    y.domain(d3.extent(data, function(d) { return d.y; })).nice();
    color.domain(d3.extent(data, function(d) { return d.color; })).nice();
    size.domain(d3.extent(data, function(d) { return d.size; })).nice();

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Year");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")/*
        .text("Energy");*/

    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return size(d.size); })
        .attr("title", function(d) { return d.name; })
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); })
        .style("fill", function(d) { return color(d.color); });
  }

});
