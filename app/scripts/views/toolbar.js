whitburn.Views.Toolbar = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/toolbar.ejs'}),
  events: {
    "change .filter-x" : "onChangeX",
    "change .filter-y" : "onChangeY"
  },

  initialize: function() {
    _.bindAll(this, 'render');
  },

  render: function() {
    this.$el.html(this.template.render());

    return this.$el;
  },

  onChangeX: function(e) {
    var target = $(e.target);
    this.model.set('param_x', target.val());
  },

  onChangeY: function(e) {
    var target = $(e.target);
    this.model.set('param_y', target.val());
  }

});
