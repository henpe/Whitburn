whitburn.Routers.Application = Backbone.Router.extend({

  routes: {
      '':                 'home',
      'track/:track':     'track'
    },

    initialize: function(options) {
      if (options.model) { this.model = options.model; }
    },

    home: function() {
      console.debug('Route: Home', this.model);
    },

    track: function(id) {
      console.debug('Route: Track', this.model);
      this.model.set('currentTrack', id);
    }
});
