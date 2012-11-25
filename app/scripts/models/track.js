whitburn.Models.Track = Backbone.Model.extend({

  defaults: {
    isInitialized: false
  },

  modes: ['Major', 'Minor'],
  chromaticScale: ['C', 'D&#9837;', 'D', 'E&#9837;', 'E', 'F', 'G&#9837;', 'G', 'A&#9837;', 'A', 'B&#9837;', 'B'],

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

  parse: function(response) {
    var value,
        summary = response.audio_summary;
    if (summary) {
      value = summary.mode;
      summary.mode = { value: value, label: this.modes[value] };
      value = summary.key;
      summary.key = { value: value, label: this.chromaticScale[value] };
      summary.tempo = Math.round(parseFloat(summary.tempo));

      summary.energy = summary.energy.toFixed(2);
      summary.liveness = summary.liveness.toFixed(2);
      summary.danceability = summary.danceability.toFixed(2);
    }

    if (response.tracks) {
      _.each(response.tracks, function(track) {
        if (track.catalog === "spotify-WW") {
          response.spotify_link = 'http://open.spotify.com/track/' + track.id;
        }
      });
    }

    var date;
    if (response.datePeaked) {
      date = response.dateEntered.replace('+','').split('/');
      response.date_peaked = new Date(date[2], date[1], date[0]);
      delete response.datePeaked;
    }
    if (response.dateEntered) {
      date = response.dateEntered.replace('+','').split('/');
      response.date_entered = new Date(date[2], date[1], date[0]);
      delete response.dateEntered;
    } else {
      response.date_entered = new Date(response.year, 0, 0);
    }
    response.no_of_weeks_charted = response.ch;
    response.yearly_rank = parseInt(response.yearlyRank, 10);

    delete response.ch;
    delete response.yearlyRank;

    return response;
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
