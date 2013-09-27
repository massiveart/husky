define(['underscore', 'jquery'], function(_, $) {

    'use strict';

    function TemplateManager(options) {
        this.options = _.defaults(options || {}, {
            type: 'html',
            compiler: _.template,
            lookup: [],
            components: 'aura_components'
        });

        this.cache = {};
        this.options.lookup.push(this.cache);
    }

    TemplateManager.prototype = {
        load: function(names, widget) {
            names = _.isString(names) ? [names] : names;

            var resolved = {},
                unresolved = [],
                deferred, files;

            _.each(names, function(name) {
                var template = this.find(widget + '/' + name);
                if (template) {
                    resolved[name] = template;
                } else {
                    unresolved.push(name);
                }
            }, this);

            deferred = new $.Deferred();

            if (!unresolved.length) {
                deferred.resolve(resolved);
            } else {
                files = _.map(unresolved, function(u) {
                    var path = u + '.' + this.options.type;
                    if (u.indexOf('/') !== 0) {
                        // TODO default path
                    }
                    return 'text!' + path;
                }, this);

                require(files, _.bind(function() {
                    _.each(Array.prototype.slice.call(arguments), function(template, i) {
                        resolved[unresolved[i]] = this.options.compiler(template);
                        this.cache[widget + '/' + name] = this.options.compiler(template);
                    }, this);

                    deferred.resolve(resolved);
                }, this), function(error) {
                    deferred.reject(error);
                });
            }

            return deferred.promise();
        },

        find: function(name, namespace) {
            namespace = namespace || 'aura';
            var template = $('script[data-' + namespace + '-template="' + name + '"]').html(),
                hash;

            if (template) {
                return this.options.compiler(template);
            } else {
                hash = _.find(this.options.lookup, function(h) {
                    return !!h[name];
                }) || {};

                return hash[name];
            }
        }
    };

    return function(app) {
        var manager = new TemplateManager(app.config.template);

        app.core.Components.Base.prototype.renderTemplate = function(tplName, context) {

            if (typeof this.loadedTemplates[tplName] === 'function') {
                var tpl = this.loadedTemplates[tplName],
                    regExp = new RegExp('(###\\w*###)', 'gi'),
                    template = tpl(context),
                    result = template.match(regExp);

                if (!!result) {
                    this.sandbox.util.each(result, function(key, value) {
                        key = value.replace(/#/g, '');
                        template = template.replace(new RegExp(value, 'g'), this.sandbox.translate(key));
                    }.bind(this));
                }

                return template;
            } else {
                return 'Template ' + tplName + ' not found.';
            }
        };

        app.components.before('initialize', function() {

            this.loadedTemplates = {};

            if (!this.templates || !this.templates.length) {
                return;
            }

            var loading = manager.load(this.templates, this.options.name);
            loading.done(_.bind(function(templates) {
                this.loadedTemplates = templates;
            }, this));

            return loading.promise();
        });
    };

});
