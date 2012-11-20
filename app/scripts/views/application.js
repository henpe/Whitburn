whitburn.Views.Application = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/application.ejs'}),

  initialize: function() {
    _.bindAll(this, 'render', 'setup');

    // Bind to model events
    this.model.on('change:isInitialized', this.setup);
  },

  setup: function() {
    this.$el.html(this.template.render());

    // Create child views
    var playerTracksCollection = new whitburn.Collections.PlayerTracks();

    this.views = {
      sidebar: new whitburn.Views.Sidebar({el: '#sidebar', model: this.model}),
      toolbar: new whitburn.Views.Toolbar({el: '#toolbar', model: this.model}),
      scatterPlot: new whitburn.Views.ScatterPlot({el: '#plot', model: this.model, collection: this.model.get('tracks')}),
      player:      new whitburn.Views.Player({el: '#player', model: this.model, collection: playerTracksCollection })
    };
    this.render();
  },

  render: function() {
    var self = this;
    //this.$el.html(this.template.render());

    _.each(this.views, function(view) {
      view.render();
    });
  }

});
