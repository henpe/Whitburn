whitburn.Collections.Tracks = Backbone.Collection.extend({

  url: '/data/tracks_data.json',

  model: whitburn.Models.Track,

  initialize: function() {

  },

  parse: function(response) {
    this.timestamps = {};
    _.each(response, function(track) {
      if (track.audio && track.audio.timestamp) {
        this.timestamps[Math.round(track.audio.timestamp)] = track.id || track.title;
      }
    }, this);
    return response;
  },

  getTrackAtTime: function(seconds) {
    return _.find(this.timestamps, function(value, key) {
      return key >= seconds;
    });
  }
});
