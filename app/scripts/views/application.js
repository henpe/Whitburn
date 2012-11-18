whitburn.Views.Application = Backbone.View.extend({

  template: new EJS({url: '/scripts/templates/application.ejs'}),

  initialize: function() {
    _.bindAll(this, 'render', 'setup');

    // Bind to model events
    this.model.on('change:isInitialized', this.setup);
  },

  setup: function() {
    // Create child views
    console.log('x', this.model);
    this.views = {
      scatterPlot: new whitburn.Views.ScatterPlot({collection: this.model.get('tracks')})
    };
    this.render();
  },

  render: function() {
    var self = this;
    //this.$el.html(this.template.render());

    _.each(this.views, function(view) {
      self.$el.append(view.el);
      view.render();
    });
  }

});
