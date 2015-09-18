# Upgrade

## Dev-develop

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
