whitburn.Views.Sidebar = Backbone.View.extend({

  template: new EJS({url: 'scripts/templates/sidebar.ejs'}),
  events: {

  },

  initialize: function() {
    _.bindAll(this, 'render');
  },

  render: function() {
    this.$el.html(this.template.render());

    twttr.widgets.load();

    return this.$el;
  },

  show: function(id) {
    console.log("dd", id);
    this.$el.find('.panel.active')
        .removeClass('active')
        .hide();
    this.$el.find('#panel-' + id)
        .addClass('active')
        .show();
  }
});
