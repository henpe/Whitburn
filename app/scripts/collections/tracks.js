whitburn.Collections.Tracks = Backbone.Collection.extend({

  url: '/data/tracks_data_1-5.json',

  model: whitburn.Models.Track,

  initialize: function() {

  },

  parse: function(response) {
    this.timestamps = {};
    _.each(response, function(track) {
      if (track.audio && track.audio.timestamp) {
        this.timestamps[Math.round(track.audio.timestamp)] = track.year + "-" + track.yearly_rank;
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
