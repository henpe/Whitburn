whitburn.Models.Application = Backbone.Model.extend({

  initialize: function() {
    var self = this;
    // Fetch Fusion data
    $.ajax(
      app.FUSION_API + '/query',
      {
        dataType: 'json',
        data: {
          key: app.FUSION_KEY,
          sql: 'SELECT Year, Artist, Track, Album, Time, CH FROM ' + app.FUSION_TABLE
        },
        success: function(data) {
          var tracks = [];
          _.each(data.rows, function(row, index) {
            tracks.push({
              year: new Date(row[0]),
              artist: row[1],
              name: row[2],
              album: row[3],
              duration: row[4],
              no_of_weeks_charted: row[5]
            });
          });
          self.set('tracks', new app.Collections.Tracks(tracks));
          self.set('isInitialized', true);
        }
      }
    );
  }

});
