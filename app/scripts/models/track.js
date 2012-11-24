whitburn.Models.Track = Backbone.Model.extend({

  defaults: {
    isInitialized: false
  },

  initialize: function() {
    var self = this;
    if (this.get("name")) {
      //this.fetchMetaData().always(function(){
        self.set('isInitialized', true);
      //});
    } else {
      self.set('isInitialized', true);
    }
  },

  fetchMetaData: function() {
    var self = this;
    var url = encodeURIComponent(
      app.ECHONEST_API +
      '/song/search?' +
      'bucket=id:7digital-US&' +
      'bucket=tracks&' +
      'bucket=audio_summary&' +
      'bucket=song_hotttnesss&' +
      'bucket=song_type&' +
      'api_key=' + app.ECHONEST_KEY + '&' +
      'combined=' + this.get('artist') + ' ' + this.get('name')
    );
    var request = $.ajax(app.ECHONEST_PROXY + url,
      {
        dataType: 'json',
        localCache: true,
        /*data: {
          api_key: app.ECHONEST_KEY,
          combined: this.get('artist') + ' ' + this.get('name')
        },*/
        success: function(data) {
          if (data && data.response && data.response.songs) {
            // Get the first track where the artist property is the same as the song artist
            var track = _.detect(data.response.songs, function(song) {
              return song.artist_name.toLowerCase() === self.get('artist').toLowerCase();
            });

            // Copy track properties
            _.each(track, function(value, key) {
              if (key === 'tracks') { value = value[0]; }
              self.set(key, value);
            });
          }
        }
      }
    );

    return request.promise();
  }
});
