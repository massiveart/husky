# CHANGELOG for husky

* dev-develop
    * BUGFIX      #746 Considered mime type when adding image to dropzone
    * ENHANCEMENT #742 Extracted expression into a service
    * BUGFIX      #744 Removed default placeholder for datepicker
    * ENHANCEMENT #741 Change logo by overwritable variable in navigation
    * BUGFIX      #734 Adapted overlays to match grid system

* 0.26.0 (2016-10-06)
    * FEATURE     #737 Added possibility to define overlay spacing for each slide
    * BUGFIX      #738 Removed action icon in datagrid if no icon is defined
    * ENHANCEMENT #735 Added maxHeight options to toolbar dropdownOptions
    * BUGFIX      #722 Fixed create hover button for ghost pages and made it optional
    * FEATURE     #733 Created addImage functionality in dropzone
    * ENHANCEMENT #723 Added description class to itembox and made content take up the whole width
    * FEATURE     #714 Tabs and language Changer are now in a new section -> language Changer can be used without Tabs.
    * BUGFIX      #729 Update parent checkbox style when removing child in table-view datagrid-decorator
    * BUGFIX      #729 Remove children rows on parent deletion in table-view datagrid-decorator
    * ENHANCEMENT #731 Added expandIds-option to the datagrid component
    * ENHANCEMENT #721 Improved cropping in tiles view and fixed dropzone issue when destroying
    * ENHANCEMENT #715 Display effective limit in dropdown-pagination decorator
    * ENHANCEMENT #715 Replace expand-icon with loader when loading children in datagrid
    * ENHANCEMENT #715 Append currently selected items to request when loading data in datagrid
    * BUGFIX      #707 Added translations to titles in matrix
    * BUGFIX      #718 Made infinite scroll pagination add all records at once if possible
    * ENHANCEMENT #716 Made the reset to the "show all" only happen, when the datagrid was in the "show selected" state before
    * ENHANCEMENT #713 Removed overlay from dropzone and implemented own overlay-style for dropzone
    * ENHANCEMENT #712 Removed data-navigation from navigation component
    * FEATURE     #706 Created tiles view for datagrid
    * FEATURE     #705 Added placeholder option to ckeditor component

* 0.25.1 (2016-09-15)
    * HOTFIX      #726 Added singleMarkable option and get-marked event
    * HOTFIX      #725 Added locale to pagination request of data-navigation

* 0.25.0 (2016-08-11)
    * BUGFIX      #709 Removed action icon for ghost pages in column-navigation
    * ENHANCEMENT #700 added datagrid get-records and delete-records event
    * BUGFIX      #708 Only show draft and publish icons in column navigation when page is no ghost
    * BUGFIX      #710 Fixed tooltip translations in column-navigation

* 0.24.0 (2016-08-08)
    * ENHANCEMENT #698 Added responsive-width skin in overlay component
    * ENHANCEMENT #702 Implemented error handling on column-navigation load
    * BUGFIX      #699 Made url comparison in navigation use url parts an not characters
    * ENHANCEMENT #698 Created published icons for itembox
    * BUGFIX      #701 Prefixed the slide class of the search component
    * BUGFIX      #696 prevent propagation of key events in search component
    * BUGFIX      #695 added a locale field to the data navigation

* 0.23.0 (2016-07-28)
    * FEATURE     #697 Created buttons for label component
    * BUGFIX      #687 fixed thumbnail rendering in datagrid
    * BUGFIX      #694 prevent item select when ordering a column

* 0.22.0 (2016-07-21)
    * ENHANCEMENT #692 fixed style bug on add button
    * ENHANCEMENT #689 removed dead thumbnails view
    * BUGFIX      #686 removed "click," event from ckeditor (notice the ",")
    * BUGFIX      #685 navigation refactoring and made navigation history back sensitive
    * ENHANCEMENT #691 Added badge colors
    * ENHANCEMENT #684 Added parameter 'valueKey' to auto-complete-list
    * FEATURE     #681 add auto-complete form mapper validation type
    * BUGFIX      #680 reseted navigation width after collapse
    * BUGFIX      #673 changed markup of search icon (fixes redirect bug)
    * ENHANCEMENT #671 Updated to current version of husky-validation
    * BUGFIX      #670 Fixed Globalizing timing issue
    * FEATURE     #661 Added second dot in column navigation for draft
    * FEATURE     #664 Collapse dropdown button without visible items in list
    * FEATURE     #636 Added possibility to display small labels
    * BUGFIX      #666 Added auto-start on focus
    * FEATURE     #662 Added select field to editable inputs
    * FEATURE     #654 Added util function sprintf
    * FEATURE     #653 Added differentiation betweeen available and active toolbar
    * FEATURE     #658 Fixed initialization of datagrid decorator
    * FEATURE     #654 Added util function sprintf
    * BUGFIX      #652 Added hide tabs for only one single tab
    * ENHANCEMENT #651 Added auto-start option for ckeditor component
    * FEATURE     #643 Added ckeditor plugin registry
    * BUGFIX      #644 Fixed scrollable tabs
    * FEATURE     #641 Added preselect callback for toolbar button
    * BUGFIX      #633 Removed bound effect respectively additional scrollbar

* 0.21.1 (2016-07-14)
    * HOTFIX      #688 fixed child order in datagrid
    * HOTFIX      #670 workaround for ie dorpdown issue
    * HOTFIX      #679 Globalize: Fixed loading correct file when culture name includes country

* 0.21.0 (2016-07-05)
    * BUGFIX      #670 Fixed Globalizing timing issue

* 0.20.0 (2016-06-28)
    * HOTFIX      #660 Fixed timing of localization initialization
    * ENHANCEMENT #657 Added new function 'records.set' for datagrid

* 0.19.3 (2016-06-01)
    * HOTFIX      #649 Use correct culture name when locale includes country

* 0.19.2 (2016-05-09)
    * HOTFIX      #646 Added a scrolling mechanism to the select dropdown

* 0.19.1 (2016-04-26)
    * HOTFIX      #640 Load correct globalize.culture file
    * HOTFIX      #635 Fixed communication with front dropdown in url-input
    * HOTFIX      #634 Fixed wrong spacing between more than two checkboxes

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
