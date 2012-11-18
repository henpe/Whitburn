whitburn.Views.Player = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/player.ejs'}),
  scrubbing: false,

  events: {
    'click .play-pause' : 'handlePlayPause'
  },

  initialize: function() {
    _.bindAll(this, 'render');

    var self = this;
    setInterval(function() {
      self.updateSlider();
    }, 1000);


    soundcloud.addEventListener('onMediaPlay', function(player, data) {
      self.$el.addClass('playing');

    });
    soundcloud.addEventListener('onMediaPause', function(player, data) {
      self.$el.removeClass('playing');
    });

  },

  handlePlayPause: function() {
    mainPlayer.api_toggle();
  },

  updateSlider: function() {
    if (mainPlayer && this.scrubbing === false) {
      var position = mainPlayer.api_getTrackPosition(),
          year     = this.collection.getYearForTime(position);

      this.$('.slider').slider('value', year);

      this.goToYear(year);
    }
  },

  goToYear: function(year) {
      this.currentYear = year;
      this.$('.year').text(year);
      console.log('going to year '+year);

      // Broadcast here
      this.model.trigger('player:year', this.currentYear);
  },

  render: function() {
    var self = this;

    this.$el.html(this.template.render());

    this.slider = this.$(".slider").slider({
      min: 1890,
      max: 2011,
      start: function() {
        self.scrubbing = true;
      },
      stop: function() {
        self.scrubbing = false;
      },
      slide: function(event, ui) {
        self.currentYear = ui.value;
        self.goToYear(self.currentYear);

        var track = self.collection.getTrackForYear(self.currentYear);
        if (track) {
          mainPlayer.api_seekTo(track.get('timestamp'));
          mainPlayer.api_play();
        }
      }
    });
  }


});
