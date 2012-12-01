whitburn.Views.ScatterPlot = Backbone.View.extend({

  template: new EJS({url: '/scripts/templates/scatterplot.ejs'}),

  initialize: function() {
    _.bindAll(this,
      'render',
      'renderPlot',
      'updateAudioElements',
      'changeY',
      'changeColour',
      'changeSize',
      'onClick'
    );

    this.model.bind('change:isPlaying', this.updateAudioElements);
    this.model.bind('change:param_x', this.render);
    this.model.bind('change:param_y', this.changeY);
    this.model.bind('change:param_color', this.changeColour);
    this.model.bind('change:param_size', this.changeSize);
  },

  render: function() {
    this.$el.html(this.template.render());

    // Create D3 scatterplot
    this.renderPlot();

    return this.$el;
  },

  renderPlot: function() {
    var self = this;

    // Parameters
    var param_x = this.model.get('param_x'),
        param_y = this.model.get('param_y'),
        param_color = this.model.get('param_color'),
        param_size = this.model.get('param_size');

    // Container
    var containerHeight = this.$el.height();
        containerWidth = this.$el.width();

    // Dimensions
    var margin = {top: 30, right: 30, bottom: 30, left: 40},
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
    this.colorScale = d3.scale.linear().range(["#0000cc", "#cc0000"]);
    this.sizeScale = d3.scale.linear().range([3, 10]);
    this.chromaticScale = d3.scale.ordinal().range(['C', 'D&#9837;', 'D', 'E&#9837;', 'E', 'F', 'G&#9837;', 'G', 'A&#9837;', 'A', 'B&#9837;', 'B']);

    // Axes
    this.xAxis = d3.svg.axis()
                  .scale(this.xScale)
                  .orient("bottom");
    this.yAxis = d3.svg.axis()
                  .scale(this.yScale)
                  .orient("left");

    // Create data array
    this.data = [];
    this.collection.each(function(model) {
      if (!model.get('echonest_id')) return;
      // Copy track properties
      var track = {
        id: model.get('id'),
        name: model.get('title'),
        artist: model.get('artist_name'),
        no_of_weeks_charted: parseInt(model.get('no_of_weeks_charted'), 10),
        song_hotttnesss: model.get('song_hotttnesss'),
        visible: true,
        date: model.get('date_entered')
      };

      // Copy audio summary properties
      var summary = model.get('audio_summary');
      if (summary) {
        track.danceability = summary.danceability;
        track.duration = summary.duration;
        track.energy = summary.energy;
        track.key = summary.key.value;
        track.liveness = summary.liveness;
        track.loudness = summary.loudness;
        track.mode = summary.mode.value;
        track.speechiness = summary.speechiness;
        track.tempo = summary.tempo;
        track.time_signature = summary.time_signature;
      }

      track.in_remix = (model.get('audio'));

      self.data.push(track);
    });

    // Set scale domains
    this.xScale.domain(d3.extent(this.data, function(d) { return d[param_x]; })).nice();
    this.yScale.domain(d3.extent(this.data, function(d) { return d[param_y]; })).nice();
    this.colorScale.domain(d3.extent(this.data, function(d) { return d[param_color]; })).nice();
    this.sizeScale.domain(d3.extent(this.data, function(d) { return d[param_size]; })).nice();

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
        .attr("class", function(d) { return (d.in_remix) ? "dot in-remix" : "dot"; })
        .attr("id", function(d) { return 't-' + d.id; })
        .attr("r", function(d) { return self.sizeScale(d[param_size]); })
        .attr("title", function(d) { return d.name; })
        .attr("cx", function(d) { return self.xScale(d[param_x]); })
        .attr("cy", function(d) { return self.yScale(d[param_y]); })
        .style("fill", function(d) { return self.colorScale(d[param_color]); })
      .on("click", this.onClick);

    this.svg.selectAll('.dot')
        .call(bootstrap.tooltip()
          .placement("right"));
  },

  updateAudioElements: function(model, value, options) {
    var self = this,
        param_color = this.model.get('param_color');

    if (value) {
      this.svg.selectAll('.dot:not(.in-remix)')
          .transition()
          .ease('linear')
          .duration(800)
          .style('fill', '#bbb')
          .style('opacity', 0.8);
    } else {
      this.svg.selectAll('.dot')
          .transition()
          .ease('linear')
          .duration(800)
          .style('fill',  function(d) { return self.colorScale(d[param_color]); })
          .style('opacity', 1);
    }
  },

  changeY: function() {
    var self = this,
        param_y = this.model.get('param_y');

    /*if (param_y === 'key') {
      this.yAxis.scale(this.chromaticScale);
      this.yScale = this.chromaticScale;
    }*/

    this.yScale.domain(d3.extent(this.data, function(d) { return d[param_y]; })).nice();

    this.svg.selectAll('.dot')
        .transition()
        .ease('linear')
        .duration(1000)
        .attr("cy", function(d) { return self.yScale(d[param_y]); });

    this.svg.selectAll('.y')
        .transition()
        .ease('linear')
        .duration(1000)
        .call(this.yAxis);
  },

  changeColour: function() {
    var self = this,
        param_color = this.model.get('param_color');

    this.colorScale.domain(d3.extent(this.data, function(d) { return d[param_color]; })).nice();

    this.svg.selectAll('.dot')
      .transition()
      .ease('linear')
      .duration(500)
      .style("fill", function(d) { return self.colorScale(d[param_color]); });
  },

  changeSize: function() {
    var self = this,
        param_size = this.model.get('param_size');

    this.sizeScale.domain(d3.extent(this.data, function(d) { return d[param_size]; })).nice();

    this.svg.selectAll('.dot')
      .transition()
      .ease('linear')
      .duration(500)
      .attr("r", function(d) { return self.sizeScale(d[param_size]); });
  },

  onClick: function(e, g, h) {
    this.svg.selectAll('circle.active').classed('active', false);
    if (e.id) {
      this.svg.selectAll('#t-' + e.id).classed('active', true);
      var route = e.id.replace('-', '/');
      app.router.navigate(route, {trigger: true});
    }
  }

});
