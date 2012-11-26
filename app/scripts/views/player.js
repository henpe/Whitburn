whitburn.Views.Player = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/player.ejs'}),
  scrubbing: false,

  events: {
    'click .play-pause' : 'handlePlayPause'
  },

  initialize: function() {
    _.bindAll(this, 'render');

    var self = this;
    soundcloud.addEventListener('onPlayerReady', function(player, data) {
        self.scPlayer = soundcloud.getPlayer('mainPlayer');
        self.duration = self.scPlayer.api_getTrackDuration();
        self.createSlider(self.duration);
    });

    soundcloud.addEventListener('onMediaPlay', function(player, data) {
      self.$el.addClass('playing');

    });
    soundcloud.addEventListener('onMediaPause', function(player, data) {
      self.$el.removeClass('playing');
    });

  },

  handlePlayPause: function() {
    this.scPlayer.api_toggle();
  },

  createSlider: function(duration) {
    var self = this;
    this.slider = this.$(".slider").slider({
      min: 0,
      max: duration,
      start: function() {
        self.scrubbing = true;
      },
      stop: function() {
        self.scrubbing = false;
      },
      slide: function(event, ui) {
        self.goToTrack(ui.value);
        self.scPlayer.api_seekTo(ui.value);
        self.scPlayer.api_play();
      }
    });

    // Update slider once per second
    self._sliderInterval = setInterval(function() {
      self.updateSlider();
    }, 1000);
  },

  updateSlider: function() {
    if (this.scPlayer && this.scrubbing === false) {
      var position = this.scPlayer.api_getTrackPosition();
      this.$('.slider').slider('value', position);
      this.goToTrack(position);
    }
  },

  goToTrack: function(position) {
      // Todo: Check if position matches audio timestamp
      // If yes, grab track ID and broadcast it
      this.model.trigger('player:track', this.currentTrack);
  },

  render: function() {
    var self = this;

    this.$el.html(this.template.render());
  }


});
