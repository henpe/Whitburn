whitburn.Models.Application = Backbone.Model.extend({

  fetchTracks: function() {
    this.set('tracks', new app.Collections.Tracks());
    return this.get('tracks').fetch();
  }

});
