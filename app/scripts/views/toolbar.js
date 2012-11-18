whitburn.Views.Toolbar = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/toolbar.ejs'}),

  initialize: function() {
    _.bindAll(this, 'render');
  },

  render: function() {
    this.$el.html(this.template.render());

    return this.$el;
  }

});
