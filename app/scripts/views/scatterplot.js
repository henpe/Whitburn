whitburn.Views.ScatterPlot = Backbone.View.extend({

  template: new EJS({url: '/scripts/templates/scatterplot.ejs'}),

  initialize: function() {
    _.bindAll(this,
      'render',
      'renderPlot',
      'changeY',
      'changeColour',
      'changeSize',
      'onClick'
    );

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
    var self = this;

    // Parameters
    var param_x = this.model.get('param_x') || 'date',
        param_y = this.model.get('param_y') || 'no_of_weeks_charted',
        param_color = this.model.get('param_colour') || 'song_hotttnesss',
        param_size = this.model.get('param_size') || 'duration';

    // Container
    var containerHeight = this.$el.height();
        containerWidth = this.$el.width();

    // Dimensions
    var margin = {top: 40, right: 40, bottom: 40, left: 50},
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
      if (!model.get('id')) return;
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
        .attr("class", "dot")
        .attr("id", function(d) { return d.id; })
        //.attr("id", function(d) { return 'year-' + d.year; })
        .attr("r", function(d) { return self.sizeScale(d[param_size]); })
        .attr("title", function(d) { return 'x' + d.name; })
        .attr("cx", function(d) { return self.xScale(d[param_x]); })
        .attr("cy", function(d) { return self.yScale(d[param_y]); })
        .style("fill", function(d) { return self.colorScale(d[param_color]); })
      .on("click", this.onClick);
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
        param_color = this.model.get('param_colour');

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
  },

  onClick: function(e) {
    if (e.id) {
      app.router.navigate('track/' + e.id, {trigger: true});
    }
  }

});
