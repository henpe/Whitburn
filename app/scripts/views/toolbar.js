whitburn.Views.Toolbar = Backbone.View.extend({

  template: new EJS({url: '/scripts/templates/toolbar.ejs'}),
  events: {
    "change .filter-x"      : "onChangeX",
    "change .filter-y"      : "onChangeY",
    "change .filter-colour" : "onChangeColour",
    "change .filter-size"   : "onChangeSize"
  },

  initialize: function() {
    _.bindAll(this, 'render');
  },

  render: function() {
    this.$el.html(this.template.render());
    this.$el.find('select').select2();

    return this.$el;
  },

  onChangeX: function(e) {
    var target = $(e.target);
    this.model.set('param_x', target.val());
  },

  onChangeY: function(e) {
    var target = $(e.target);
    this.model.set('param_y', target.val());
  },

  onChangeColour: function(e) {
    var target = $(e.target);
    this.model.set('param_colour', target.val());
  },

  onChangeSize: function(e) {
    var target = $(e.target);
    this.model.set('param_size', target.val());
  }

});
