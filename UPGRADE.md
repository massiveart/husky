# Upgrade

## 0.26.0

### Lock and Unlocking the dropzone overlay

The behaviour of the overlay in the dropzone got slightly changed.
The changes introduced, forces the overlay to either be a popup
or a "normal" dropzone directly rendered into the dom. This changes
made locking and unlocking the dropzone popup obsolete.

### Dropzone canceling upload when overlay closes

The component option `cancelUploadOnOverlayClick` got renamed to
`cancelUploadOnOverlayClose`.

## 0.24.0

### DataNavigation locale

When the data navigation initializes it waits for a locale, which
can be either passed via its options or with an event. The name
of the introduced option is `locale`, the event is called
`husky.data-navigation.set-locale`.

### Thumbnail view in datagrid

The thumbnail view in the datagrid got removed and is not supported
anymore.

## 0.17.0

### DataNavigation events

The data navigation events `husky.data-navigation.select` have been renamed to
`husky.data-navigation.selected`, because they are emitted after an element has
been selected.

## 0.16.0

### Infinite scroll
The infinite-scroll-extension got refactored. To initialize infinite-scroll on an element, use
"this.sandbox.infiniteScroll.initialize(selector, callback)" instead of "this.sandbox.infiniteScroll(selector, callback)" now.
To unbind an infinite-scroll handler, use "this.sandbox.infiniteScroll.destroy(selector)"

### Toolbar
- 'blueish' style got removed. 'big' style was added
- options.data renamed to options.buttons
- changes in the buttons api:
    - 'type' deleted
    - 'iconSize' deleted
    - 'hideTitle' deleted
    - 'items' renamed in 'dropdownItems'
    - 'itemsOptions' renamed in 'dropdownOptions'
        - 'markable' renamed in 'markSelected'
        - 'changeButton' new instead of 'type: "select"'
        - 'translate' removed
        - 'languageNamespace' removed

### Util-Extension
- events 'husky.util.load.data' and 'husky.util.save.data' got removed
