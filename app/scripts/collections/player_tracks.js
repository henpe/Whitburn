whitburn.Collections.PlayerTracks = Backbone.Collection.extend({

  url: 'data/tracklist.json',

  initialize: function() {
    this.fetch();
  },

  getTrackForYear: function(year) {
    year = parseInt(year, 10);

    var track = this.find(function(model) {

        return model.attributes.year == year;
    });

    if (typeof track === "undefined") {
        return false;
    } else {
        return track;
    }
  },

  getYearForTime: function(timestamp) {
    var model = this.find(function(model) {
        return model.attributes.timestamp > timestamp;
    });

    return model.get('year');
  }

});
