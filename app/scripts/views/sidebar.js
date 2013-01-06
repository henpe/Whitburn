whitburn.Views.Sidebar = Backbone.View.extend({

  template: new EJS({url: '/scripts/templates/sidebar.ejs'}),
  metaDataTemplate: new EJS({url: '/scripts/templates/track_metadata.ejs'}),
  socialTemplate: new EJS({url: '/scripts/templates/track_social.ejs'}),
  buyTemplate: new EJS({url: '/scripts/templates/track_buy.ejs'}),
  events: {

  },

  initialize: function() {
    _.bindAll(this, 'render', 'onChangeTrack');

    this.model.bind('change:currentTrack', this.onChangeTrack);
  },

  render: function() {
    this.$el.html(this.template.render());

    return this.$el;
  },

  show: function(id) {
    this.$el.find('.panel.active')
        .removeClass('active')
        .hide();
    this.$el.find('#panel-' + id)
        .addClass('active')
        .show();
  },

  onChangeTrack: function(model) {
    var id = this.model.get('currentTrack'),
        track = this.model.get('tracks').get(id);

    if (track) {
      this.show('track');

      var audio_summary = track.get('audio_summary');

      // Update metadata
      this.$el.find('.track-title').text(track.get('song'));
      this.$el.find('.track-artist').text(track.get('artist'));

      var ordinal = this.getOrdinal(track.get('yearly_rank'));
      this.$el.find('.track-meta').html(
        this.metaDataTemplate.render({
          year: track.get('year'),
          rank: track.get('yearly_rank') + ordinal,
          audio_summary: audio_summary
        })
      );

      this.$el.find('.track-social').html(
        this.socialTemplate.render({
          year: track.get('year'),
          rank: track.get('yearly_rank'),
          id: track.get('id'),
          title: track.get('title'),
          artist: track.get('artist')
        })
      );

      // Do not use template for the bars in order
      // to do CSS animation
      if (audio_summary) {
        this.$el.find('.track-audio-metrics').show();
        var node = this.$el.find('.track-metric-energy');
        node.find('.bar span').css({width: audio_summary.energy * 100 + '%'});
        node.find('.value').text(audio_summary.energy);

        node = this.$el.find('.track-metric-danceability');
        node.find('.bar span').css({width: audio_summary.danceability * 100 + '%'});
        node.find('.value').text(audio_summary.danceability);

        node = this.$el.find('.track-metric-speechiness');
        node.find('.bar span').css({width: audio_summary.speechiness * 100 + '%'});
        node.find('.value').text(audio_summary.speechiness);

        node = this.$el.find('.track-metric-liveness');
        node.find('.bar span').css({width: audio_summary.liveness * 100 + '%'});
        node.find('.value').text(audio_summary.liveness);
      } else {
        this.$el.find('.track-audio-metrics').hide();
      }

      // Buy and external player links
      this.$el.find('.track-buy').html(
        this.buyTemplate.render({
          title: track.get('title'),
          artist: track.get('artist'),
          sevendigital_link: track.get('sevendigital_link'),
          spotify_link: track.get('spotify_link'),
          spotify_uri: track.get('spotify_uri')
        })
      );
    }
  },

  getOrdinal: function(number) {
    var s = ["th","st","nd","rd"],
        v = number % 100;
    return (s[(v-20)%10]||s[v]||s[0]);
  }
});
