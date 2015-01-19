define(['text!./collections-list.html'], function(collectionsListTpl) {

    /**
     * @class CollectionsListView
     * @constructor
     */
    return function CollectionsListView() {
        return {
            /**
             * @method init
             */
            init: function() {
                this.template = _.template(collectionsListTpl);
                this.$el = $('<div/>', {
                    'class': 'collection-navigation-list'
                });

                return this;
            },

            /**
             * Removes the view
             * @method destroy
             * @chainable
             */
            destroy: function() {
                this.$el.off();
                this.$el.remove();
                this.$el = null;

                return this;
            },

            /**
             * @method render
             * @param {Object} data
             * @chainable
             */
            render: function(data) {
                data = data || {};
                var tpl = this.template({ data: data });

                this.$el.html(tpl);

                return this;
            },

            /**
             * Insert the html into the dom
             * @method placeAt
             * @chainable
             */
            placeAt: function(container) {
                $(container).append(this.$el);

                return this;
            }
        };
    }
});
