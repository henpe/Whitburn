whitburn.Models.Application = Backbone.Model.extend({

  initialize: function() {
    var self = this;
    // Fetch Fusion data
    $.ajax(
      app.FUSION_API + '/query',
      {
        dataType: 'jsonp',
        data: {
          key: app.FUSION_KEY,
          sql: "SELECT Year, Artist, Track, Album, 'Yearly Rank', Time, CH, 'Date Entered', 'Date Peaked' FROM " + app.FUSION_TABLE + " " +
               "WHERE 'Yearly Rank' >= 1 AND 'Yearly Rank' <= 3 " +
               "ORDER BY Year"
        },
        success: function(data) {
          var tracks = [];
          _.each(data.rows, function(row, index) {
            tracks.push({
              year: new Date(row[0]),
              artist: row[1],
              name: row[2],
              album: row[3],
              rank: row[4],
              time: row[5],
              no_of_weeks_charted: row[6],
              date_entered: row[7],
              date_peaked: row[8]
            });
          });
          self.set('tracks', new app.Collections.Tracks(tracks));

          // Dirty hack to make it work
          var initTimeout = window.setInterval(function() {
            var isReady = self.get('tracks').all(function(track) {
              return track.get('isInitialized');
            });
            if (isReady === true) {
              self.set('isInitialized', true);
              window.clearInterval(initTimeout);
            }
          }, 1000);
        }
      }
    );
  }

});
