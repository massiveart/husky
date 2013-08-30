# [ModuleName]

[Description]

[Screenshot]

## Usage

	var autoComplete = $('#content').huskyAutoComplete({
		url: '/contacts'
	});

## Options

	{
        url: '',
        valueName: 'name',
        minLength: 3,
        keyControl: true
    }

## Events

* auto-complete:loadData ...

##  Example Data from Server

Request: /contacts?search=abc

	{
		'total': 3,
		'': ...
	}