/**
 * @class GroupView (Datagrid Decorator)
 * @constructor
 *
 * @param {Object} [options] Configuration object
 *
 * @param {Boolean} [rendered] property used by the datagrid-main class
 * @param {Function} [initialize] function which gets called once at the start of the view
 * @param {Function} [render] function to render data
 * @param {Function} [destroy] function to destroy the view and unbind events
 */
define(function () {

    'use strict';

    var defaults = {

        },

        constants = {
            containerClass: 'husky-groups',
            elementsKey: 'public.elements',
            thumbnailClass: 'thumbnail',
            thumbnailContainerClass: 'thumbnails',
            groupClass: 'grid-group',
            titleClass: 'title',
            additionClass: 'addition',
            firstPictureClass: 'first',
            secondPictureClass: 'second',
            thirdPictureClass: 'third'
        },

        templates = {
            thumbnail: [
                '<div class="'+ constants.thumbnailClass +'">',
                '   <img src="<%= src %>" alt="<%= title %>" title="<%= title %>"/>',
                '</div>'
            ].join(''),
            group: [
                '<div class="'+ constants.groupClass +'">',
                '   <div class="'+ constants.thumbnailContainerClass +'"></div>',
                '   <span class="'+ constants.titleClass +'"><%= title %></span>',
                '   <span class="'+ constants.additionClass +'"><%= addition %></span>',
                '</div>'
            ].join('')
        };

    return {

        /**
         * Initializes the view, gets called only once
         * @param {Object} context The context of the datagrid class
         * @param {Object} options The options used by the view
         */
        initialize: function (context, options) {
            // context of the datagrid-component
            this.datagrid = context;

            // make sandbox available in this-context
            this.sandbox = this.datagrid.sandbox;

            // merge defaults with options
            this.options = this.sandbox.util.extend(true, {}, defaults, options);

            this.setVariables();
        },

        /**
         * Sets the starting variables for the view
         */
        setVariables: function () {
            this.rendered = false;
            this.data = null;
            this.$el = null;

            // global array to store groups
            this.groups = {};
        },

        /**
         * Method to render data in this view
         */
        render: function (data, $container) {
            this.$el = this.sandbox.dom.createElement('<div class="' + constants.containerClass + '"/>');
            this.sandbox.dom.append($container, this.$el);
            this.data = data;

            this.renderGroups(this.data.embedded);

            this.rendered = true;
        },

        /**
         * Destroys the view
         */
        destroy: function () {
            this.sandbox.dom.remove(this.$el);
        },

        /**
         * Picks out the important data and passes it to
         * a render-method
         * @param groups {Array} the groups to render
         * @param prepend {Boolean} if true groups get prepended
         */
        renderGroups: function(groups, prepend) {
            var thumbnails, title, addition;

            this.sandbox.util.foreach(groups, function(group) {
                thumbnails = [];
                title = addition = '';

                this.sandbox.util.foreach(this.datagrid.matchings, function(matching) {

                    // pick the important data out of each group
                    if (matching.type === this.datagrid.types.THUMBNAILS) {
                        thumbnails = group[matching.attribute];
                    } else if (matching.type === this.datagrid.types.TITLE) {
                        title = group[matching.attribute];
                    } else if(matching.type === this.datagrid.types.COUNT) {
                        addition += this.datagrid.manipulateContent.call(this.datagrid,
                            group[matching.attribute],
                            matching.type, this.sandbox.translate(constants.elementsKey));
                    }
                }.bind(this));

                // render the important data
                this.renderGroup(group.id, thumbnails, title, addition, prepend);
            }.bind(this));
        },

        /**
         * Renders a single group
         * @param id {Number|String} the id of the group
         * @param thumbnails {Array} the array with thumbnails
         * @param title {String} the group title
         * @param addition {String} the addition of the group
         * @param prepend {Boolean} if true the group gets prepended
         */
        renderGroup: function(id, thumbnails, title, addition, prepend) {
            var $thumbnails = [],
                $group = this.sandbox.dom.createElement(this.sandbox.util.template(templates.group)({
                title: title,
                addition: addition
            }));

            // render all thumbnails
            this.sandbox.util.foreach(thumbnails, function(thumbnail) {
                $thumbnails.push(this.sandbox.dom.createElement(this.sandbox.util.template(templates.thumbnail)({
                    src: thumbnail.url,
                    title: thumbnail.title
                })));
            }.bind(this));

            // add classes to thumbnails
            !!$thumbnails[0] && this.sandbox.dom.addClass($thumbnails[0], constants.firstPictureClass);
            !!$thumbnails[1] && this.sandbox.dom.addClass($thumbnails[1], constants.secondPictureClass);
            !!$thumbnails[2] && this.sandbox.dom.addClass($thumbnails[2], constants.thirdPictureClass);
            // append thumbnails to group
            this.sandbox.dom.append(this.sandbox.dom.find('.' + constants.thumbnailContainerClass, $group), $thumbnails);

            this.groups[id] = $group;
            if (prepend === true) {
                this.sandbox.dom.prepend(this.$el, $group);
            } else {
                this.sandbox.dom.append(this.$el, $group);
            }
            this.bindGroupDomEvents(id);
        },

        /**
         * Binds dom events on a group
         * @param id {Number|String} id of the group
         */
        bindGroupDomEvents: function(id) {
            // bring clicked thumbnails to front
            this.sandbox.dom.on(this.groups[id], 'click', function(event) {
                this.showThumbnail(id, this.sandbox.dom.$(event.currentTarget), event);
            }.bind(this), '.' + constants.thumbnailClass);

            this.sandbox.dom.on(this.groups[id], 'click', function() {
                this.datagrid.emitItemClickedEvent.call(this.datagrid, id);
            }.bind(this));
        },

        /**
         * Brings a given thumbnail of a group to the front
         * @param id {Number|String} id of the group
         * @param $thumbnail {Object} thumbnail
         */
        showThumbnail: function(id, $thumbnail, event) {
            if (!this.sandbox.dom.hasClass($thumbnail, constants.firstPictureClass)) {
                this.sandbox.dom.stopPropagation(event);
                var cssClass,
                    $first = this.sandbox.dom.find('.' + constants.thumbnailClass + '.' + constants.firstPictureClass, this.groups[id]);

                if (this.sandbox.dom.hasClass($thumbnail, constants.secondPictureClass)) {
                    cssClass = constants.secondPictureClass;
                } else {
                    cssClass = constants.thirdPictureClass;
                }

                this.sandbox.dom.removeClass($thumbnail, cssClass);
                this.sandbox.dom.removeClass($first, constants.firstPictureClass);
                this.sandbox.dom.addClass($thumbnail, constants.firstPictureClass);
                this.sandbox.dom.addClass($first, cssClass);
            }
        },

        /**
         * Adds a record to the view
         * @param record
         * @public
         */
        addRecord: function(record) {
            this.renderGroups([record], true);
        }
    };
});
