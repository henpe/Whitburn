whitburn.Views.Player = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/player.ejs'}),
  scrubbing: false,

  initialize: function() {
    _.bindAll(this, 'render');

    var self = this;
    setInterval(function() {
      self.updateSlider();
    }, 1000);
  },

  updateSlider: function() {
    if (mainPlayer && this.scrubbing === false) {
      var position = mainPlayer.api_getTrackPosition(),
          year     = this.collection.getYearForTime(position);

      this.$('.slider').slider('value', year);

      console.log('going to year '+year);
    }
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

        var track = self.collection.getTrackForYear(self.currentYear);
        if (track) {
          mainPlayer.api_seekTo(track.get('timestamp'));
          mainPlayer.api_play();

          // Broadcast here

        }
      }
    });
  }


});
