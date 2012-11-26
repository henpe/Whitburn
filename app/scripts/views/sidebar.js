whitburn.Views.Sidebar = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/sidebar.ejs'}),
  metaDataTemplate: new EJS({url: 'scripts/templates/track_metadata.ejs'}),
  buyTemplate: new EJS({url: 'scripts/templates/track_buy.ejs'}),
  events: {

  },

  initialize: function() {
    _.bindAll(this, 'render', 'onChangeTrack');

    this.model.bind('change:currentTrack', this.onChangeTrack);
  },

  render: function() {
    this.$el.html(this.template.render());
    twttr.widgets.load();

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
      var audio_summary = track.get('audio_summary');
      // Update metadata
      this.$el.find('.track-title').text(track.get('title'));
      this.$el.find('.track-artist').text(track.get('artist_name'));

      this.$el.find('.track-meta').html(
        this.metaDataTemplate.render({
          year: track.get('date_entered').getFullYear(),
          rank: track.get('yearly_rank'),
          audio_summary: audio_summary
        })
      );

      // Do not use template for the bars in order
      // to do CSS animation
      var node = this.$el.find('.track-metric-energy');
      node.find('.bar span').css({width: audio_summary.energy * 100 + '%'});
      node.find('.value').text(audio_summary.energy);

      node = this.$el.find('.track-metric-danceability');
      node.find('.bar span').css({width: audio_summary.danceability * 100 + '%'});
      node.find('.value').text(audio_summary.danceability);

      node = this.$el.find('.track-metric-liveness');
      node.find('.bar span').css({width: audio_summary.liveness * 100 + '%'});
      node.find('.value').text(audio_summary.liveness);

      // Buy and external player links
      this.$el.find('.track-buy').html(
        this.buyTemplate.render({
          sevendigital_link: track.get('sevendigital_link'),
          spotify_link: track.get('spotify_link')
        })
      );
    }
  }
});
