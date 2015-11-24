# CHANGELOG for husky

* dev-develop
    * FEATURE     #583 Added new input skin for locked-inputs
    * BUGFIX      #579 Fixed datagrid error when window resize is emitted before initialization
    * FEATURE     #582 Added currency type to datagrid
    * BUGFIX      #581 Fixed input component change event

* 0.17.0 (2015-11-18)
    * FEATURE     #580 Added set options event for column-navigation
    * ENHANCEMENT #580 Added events to data navigation for selecting items
    * BUGFIX      #576 Fixed update of data navigation

* 0.15.0 (2015-10-28)
    * datagrid
        * added infinite-scroll*pagination
        * added change-page event
    * toolbar
        * new blueish style
        * options changes
    * services
        * New util and mediator service

* 0.11.0 (2015-04-20)
    * update ckeditor:
        * version 4.4.7 update
        * add subscript and numbered list to ckeditor toolbar
        * add allow iframe and script tag option

* 0.10.0 (2015-02-24)
    * added start and destroy interface for ckeditor component
    * updated text block design in content-types
    * updated datagrid api: 'children' property is now 'hasChildren'
    * fixed indentation for datagrid code
    * fixed overlay cleanup method
    * updated aura version
    * added default icon for auto-complete list
    * fixed url-validation in husky-input
    * updated ckeditor link-dialog in extension

* 0.8.3 (2014-10-08)
    * added default icon for autocomplete
    * fixed autocomplete margin in horizontal form

* 0.8.2 (2014-10-06)
    * removed jekyll files
    * removed compass scss dependency
    * removed old unused images

* 0.8.1 (2014-10-06)
    * autocomplete-list api change:
        * 'autoCompleteIcon' is the input icon
        * 'suggestionIcon' is the icon inside the typeahead suggestion dropdown
    * using template method through sandbox
    * fixed autocomplete rendering on multiline text (show ellipsis)
    * fixed autocomplete and autocomplete-list code indentation
    * added icon for auto complete input field
    * refactored autocomplete scss code

* 0.1.0
    * Initial setup
