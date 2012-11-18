whitburn.Models.Track = Backbone.Model.extend({

  initialize: function() {
    if (this.get("name")) {
      this._fetchMetaData();
    }
  },

  _fetchMetaData: function() {
    var self = this;
    var request = $.ajax(app.ECHONEST_API + '/song/search?bucket=id:7digital-US&bucket=tracks&bucket=audio_summary&bucket=song_hotttnesss&bucket=song_type',
      {
        dataType: 'json',
        localCache: true,
        data: {
          api_key: app.ECHONEST_KEY,
          combined: this.get('artist') + ' ' + this.get('name')
        },
        success: function(data) {
          if (data.response && data.response.songs) {
            // Get the first track where the artist property is the same as the song artist
            var track = _.detect(data.response.songs, function(song) {
              return song.artist_name.toLowerCase() === self.get('artist').toLowerCase();
            });

            // Copy track properties
            _.each(track, function(value, key) {
              if (key === 'tracks') { value = value[0]; }
              self.set(key, value);
            });
            console.log('c', self.get('tracks'));
          }
        }
      }
    );

    return request.promise();
  }
});
