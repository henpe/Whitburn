whitburn.Routers.Application = Backbone.Router.extend({

  routes: {
      '':                 'home',
      ':year/:rank':      'track'
    },

    initialize: function(options) {
      if (options.model) { this.model = options.model; }
      if (options.view) { this.view = options.view; }
      this.bind('all', this._trackPageview);
    },

    home: function() {
      this.view.show("home");
    },

    track: function(year, rank) {
      var id = year + '-' + rank;
      this.model.set('currentTrack', id);
      this.view.show("track", id);
    },

    _trackPageview: function() {
      var url;
      url = Backbone.history.getFragment();
      return _gaq.push(['_trackPageview', "/" + url]);
    }
});
