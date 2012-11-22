whitburn.Views.ScatterPlot = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/scatterplot.ejs'}),

  initialize: function() {
    _.bindAll(this, 'render', 'renderPlot', 'updatePlot', 'changeY', 'changeColour', 'changeSize');

    this.currentYear = '1890'; // Shouldn't be hardcoded

    this.model.bind('change:param_x', this.render);
    this.model.bind('change:param_y', this.changeY);
    this.model.bind('change:param_colour', this.changeColour);
    this.model.bind('change:param_size', this.changeSize);
    //this.model.bind('player:year', this.updateYear);
  },

  render: function() {
    this.$el.html(this.template.render());

    // Create D3 scatterplot
    this.renderPlot();

    return this.$el;
  },

  renderPlot: function() {
    var self = this,
        param_x = this.model.get('param_x') || 'year',
        param_y = this.model.get('param_y') || 'no_of_weeks_charted',
        param_colour = this.model.get('param_colour') || 'song_hotttnesss',
        param_size = this.model.get('param_size') || 'summary.duration';

    // Container
    var containerHeight = this.$el.height();
        containerWidth = this.$el.width();

    // Dimensions
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    // SVG
    this.svg = d3.select('.scatterplot').append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scales
    this.xScale = d3.time.scale().range([0, width]);
    this.yScale = d3.scale.linear().range([height, 0]);
    this.colorScale = d3.scale.linear().range(["blue", "red"]);
    this.sizeScale = d3.scale.linear().range([5, 15]);

    // Axes
    this.xAxis = d3.svg.axis()
                  .scale(this.xScale)
                  .orient("bottom");
    this.yAxis = d3.svg.axis()
                  .scale(this.yScale)
                  .orient("left");

    // Loop through data
    this.data = [];
    this.collection.each(function(track) {
      var hotness = track.get('song_hotttnesss'),
          summary = track.get('audio_summary');

      if (!hotness) return;
      var pX = (param_x.indexOf('summary.') !== -1) ? summary[param_x.split('summary.')[1]] : track.get(param_x),
          pY = (param_y.indexOf('summary.') !== -1) ? summary[param_y.split('summary.')[1]] : track.get(param_y),
          pColour = (param_colour.indexOf('summary.') !== -1) ? summary[param_colour.split('summary.')[1]] : track.get(param_colour);
          pSize = (param_size.indexOf('summary.') !== -1) ? summary[param_size.split('summary.')[1]] : track.get(param_size);

      self.data.push({
        id: track.get('id'),
        x: pX,
        y: pY,
        size: pSize,
        color: pColour,
        visible: true,
        name: track.get('name'),
        year: track.get('year').getFullYear()
      });
    });

    // Set scale domains
    this.xScale.domain(d3.extent(this.data, function(d) { return d.x; })).nice();
    this.yScale.domain(d3.extent(this.data, function(d) { return d.y; })).nice();
    this.colorScale.domain(d3.extent(this.data, function(d) { return d.color; })).nice();
    this.sizeScale.domain(d3.extent(this.data, function(d) { return d.size; })).nice();

    // Create x-axis
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(this.xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Year");

    // Create y-axis
    this.svg.append("g")
        .attr("class", "y axis")
        .call(this.yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    // Create dots
    this.svg.selectAll(".dot")
        .data(this.data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("id", function(d) { return d.id; })
        //.attr("id", function(d) { return 'year-' + d.year; })
        .attr("r", function(d) { return self.sizeScale(d.size); })
        .attr("title", function(d) { return d.name; })
        .attr("cx", function(d) { return self.xScale(d.x); })
        .attr("cy", function(d) { return self.yScale(d.y); })
        .style("fill", function(d) { return self.colorScale(d.color); });
  },

  changeY: function() {
    var self = this,
        param_y = this.model.get('param_y');

    // Loop through data
    _.each(this.data, function(item, index) {
      var track = self.collection.get(item.id);
      if (track) {
        var summary = track.get('audio_summary');
        var pY = (param_y.indexOf('summary.') !== -1) ? summary[param_y.split('summary.')[1]] : track.get(param_y);
        self.data[index].y = pY;
      }
    });

    this.yScale.domain(d3.extent(this.data, function(d) { return d.y; })).nice();

    this.svg.selectAll('.dot')
      .transition()
      .ease('linear')
      .duration(1000)
      .attr("cy", function(d) { return self.yScale(d.y); });

    this.svg.selectAll('.y')
        .transition()
        .ease('linear')
        .duration(1000)
        .call(this.yAxis);
  },

  changeColour: function() {
    var self = this,
        param_colour = this.model.get('param_colour');

    // Loop through data
    _.each(this.data, function(item, index) {
      var track = self.collection.get(item.id);
      if (track) {
        var summary = track.get('audio_summary');
        var pColour = (param_colour.indexOf('summary.') !== -1) ? summary[param_colour.split('summary.')[1]] : track.get(param_colour);
        self.data[index].color = pColour;
      }
    });

    this.colorScale.domain(d3.extent(this.data, function(d) { return d.color; })).nice();

    this.svg.selectAll('.dot')
      .transition()
      .ease('linear')
      .duration(500)
      .style("fill", function(d) { return self.colorScale(d.color); });
  },

  changeSize: function() {
    var self = this,
        param_size = this.model.get('param_size');

    // Loop through data
    _.each(this.data, function(item, index) {
      var track = self.collection.get(item.id);
      if (track) {
        var summary = track.get('audio_summary');
        var pSize = (param_size.indexOf('summary.') !== -1) ? summary[param_size.split('summary.')[1]] : track.get(param_size);
        self.data[index].size = pSize;
      }
    });

    this.sizeScale.domain(d3.extent(this.data, function(d) { return d.size; })).nice();

    this.svg.selectAll('.dot')
      .transition()
      .ease('linear')
      .duration(500)
      .attr("r", function(d) { return self.sizeScale(d.size); });
  },

  updateYear: function(year) {
    if (this.currentYear !== year) {
      var currentTrack = this.collection.find(function(track){
        //console.log('track', track.id);
        return (track.get('year').getFullYear() === parseInt(year, 10));
      });
      
      //console.log(d3.select('circle.dot').attr('id'), currentTrack);
      this.$el.find('.artist').text(currentTrack.get('artist'));
      this.$el.find('.track-name').text(currentTrack.get('name'));
      //this.$el.find('.year').text(year);

      d3.select('.active').attr('class', 'dot');
      d3.select('#' + currentTrack.id).attr('class', 'dot active');
      this.currentYear = year;
    }
  }

});
