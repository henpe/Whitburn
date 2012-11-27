whitburn.Views.Application = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/application.ejs'}),

  initialize: function() {
    var self = this;
    _.bindAll(this, 'render', 'setup', 'show');

    this.$el.html(this.template.render());

    this.views = {
      sidebar: new whitburn.Views.Sidebar({el: '#sidebar', model: this.model}),
      toolbar: new whitburn.Views.Toolbar({el: '#toolbar', model: this.model}),
      scatterPlot: new whitburn.Views.ScatterPlot({el: '#plot', model: this.model, collection: this.model.get('tracks')}),
      player: new whitburn.Views.Player({el: '#player', model: this.model, collection: this.model.get('tracks') })
    };

    this.render();
  },

  render: function() {
    var self = this;
    //this.$el.html(this.template.render());

    _.each(this.views, function(view) {
      view.render();
    });
  },

  show: function(route, id) {
    if (route === "track" && id) {
      this.views.sidebar.show('track');
    } else {
      this.views.sidebar.show('home');
    }
  }

});
