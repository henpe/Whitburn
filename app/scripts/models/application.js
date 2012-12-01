whitburn.Models.Application = Backbone.Model.extend({

  defaults: {
    param_x: 'date',
    param_y: 'no_of_weeks_charted',
    param_color: 'song_hotttnesss',
    param_size: 'duration'
  },

  fetchTracks: function() {
    this.set('tracks', new app.Collections.Tracks());
    return this.get('tracks').fetch();
  }

});
