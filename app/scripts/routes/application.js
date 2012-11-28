whitburn.Routers.Application = Backbone.Router.extend({

  routes: {
      '':                 'home',
      ':year/:rank':      'track'
    },

    initialize: function(options) {
      if (options.model) { this.model = options.model; }
      if (options.view) { this.view = options.view; }
    },

    home: function() {
      console.debug('Route: Home', this.model);
      this.view.show("home");
    },

    track: function(year, rank) {
      var id = year + '-' + rank;
      console.debug('Route: Track', id);
      this.model.set('currentTrack', id);
      this.view.show("track", id);
    }
});
