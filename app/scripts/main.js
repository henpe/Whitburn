window.whitburn = {
  // API Keys
  FUSION_API: 'https://www.googleapis.com/fusiontables/v1',
  FUSION_KEY: 'AIzaSyB_191pMC8I2f7dezMlduf7adSrOdG1ZUQ',
  FUSION_TABLE: '12xDacf8PYq7plj-5wHr0rrRuXihqXbhZfCxZGrc',
  ECHONEST_API: 'http://developer.echonest.com/api/v4',
  ECHONEST_KEY: 'ZUDBPBLHIZ8VN23BR',
  ECHONEST_PROXY: 'http://www.deepcobalt.com/labs/whitburn/proxy/?url=',
  SEVENDIGITAL_KEY: '7d8p87g5dz8g',

  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function() {
    window.app = this;
    var self = this;

    app.model = new whitburn.Models.Application();

    // Show loading indicator
    $('#app').addClass('loading');

    // Bind to model events
    app.model.fetchTracks().done(function() {
      app.view = new whitburn.Views.Application({model: app.model, el: '#app'});
      app.router = new whitburn.Routers.Application({model: app.model, view: app.view});
      Backbone.history.start({pushState: true});
      $('#app').removeClass('loading');
    });
  }
};

$(document).ready(function(){
  whitburn.init();
});
