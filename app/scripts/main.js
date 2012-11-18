window.whitburn = {
  // API Keys
  FUSION_API: 'https://www.googleapis.com/fusiontables/v1',
  FUSION_KEY: 'AIzaSyB_191pMC8I2f7dezMlduf7adSrOdG1ZUQ',
  FUSION_TABLE: '1JoU4fhMqQNoQuHRpwXszLcF02vJ7Yhla3iiPmmk',
  ECHONEST_API: 'http://developer.echonest.com/api/v4',
  ECHONEST_KEY: 'ZUDBPBLHIZ8VN23BR',

  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function() {
    window.app = this;
    var self = this;

    app.model = new whitburn.Models.Application();
    app.view = new whitburn.Views.Application({model: app.model, el: '#container'});
  }
};

$(document).ready(function(){
  whitburn.init();
});
