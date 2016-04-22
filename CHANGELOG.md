# CHANGELOG for husky

* dev-develop
    * BUGFIX      #637 Load correct globalize.culture file
    * BUGFIX      #633 Removed bound effect respectively additional scrollbar

* 0.19.0 (2016-04-12)
    * FEATURE     #632 Fixed wrong index of regex
    * BUGFIX      #631 Fixed javascript error when clicking on column navigation options
    * FEATURE     #630 Added overlay-loader
    * BUGFIX      #629 Avoid having scientific representation of number in formatBytes method
    * BUGFIX      #628 Fixed inheriting font from FontAwesome
    * BUGFIX      #627 Fixed preselection filtering bug
    * BUGFIX      #626 Added filtering of preselected items
    * BUGFIX      #625 Improved regex for urls
    * BUGFIX      #624 Fixed ui bugs in overlay, navigation and data-navigation
    * BUGFIX      #623 Added missing value check to matrix component
    * ENHANCEMENT #622 Added navigation divider for sections with no title
    * ENHANCEMENT #620 Fixed gap between different containers and input-description
    * ENHANCEMENT #621 Made badge usable outside of datagrid
    * BUGFIX      #618 Fixed update of record with a different id property
    * FEATURE     #619 Introduced info text for dropdown
    * BUGFIX      #617 Fixed jquery text function with empty value
    * FEATURE     #597 added additional callback for select and fixed css bugs
    * BUGFIX      #616 Fixed label tick in firefox
    * ENHANCEMENT #615 Introduced no-img-icon as function to use record dependent icons
    * BUGFIX      #613 Fixed search-icon to prevent routing
    * FEATURE     #610 Added save parameter for datagrid
    * BUGFIX      #612 Fixed link style in white-boxes
    * ENHANCEMENT #614 Added evaluate tab-conditions
    * FEATURE     #608 Allows each row in the matrix component to have different values
    * ENHANCEMENT #595 Added default label for is-native selects
    * ENHANCEMENT #594 Changed style of warning label
    * ENHANCEMENT #593 Changed toggler to only use data attribute
    * FEATURE     #578 Adjusted design for multiple select
    * FEATURE     #586 Enhanced table view

* 0.18.6 (2016-03-07)
    * HOTFIX      #609 Fixed input back class overlapping
    * HOTFIX      #607 Fixed data-attribute id for auto-complete
    * ENHANCEMENT #606 Added data to retrieve event
    * ENHANCEMENT #605 Added loader to indicate loading suggestions

* 0.18.5 (2016-02-05)
    * HOTFIX      #496 Fixed globalization of datetime value which has a time component in it
    * HOTFIX      #599 Fixed rendering preselected

* 0.18.4 (2016-01-26)
    * HOTFIX      #595 Fixed required validator in husky validation

* 0.18.3 (2015-12-18)
    * ENHANCEMENT #592 Added event when datagrid calls erroneous url (loading.failed)

* 0.18.2 (2015-12-11)
    * HOTFIX      #589 Fixed opened children at startup

* 0.18.1 (2015-12-07)
    * HOTFIX      #587 Fixed language changer in overlay

* 0.18.0 (2015-12-02)
    * BUGFIX      #585 Fixed language changer in overlay
    * ENHANCEMENT #584 Implemented reset event for toolbar button
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
        * added infinite-scroll pagination
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
