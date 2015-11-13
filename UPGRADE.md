# Upgrade

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
