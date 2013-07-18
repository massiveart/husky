Husky.DEBUG = true;

describe("Husky.UI.DataGrid", function() {
    var $dataGrid;

    beforeEach(function() {
        $dataGrid = $('<div id="data-grid"/>');
        $('body').append($dataGrid);
    });

    afterEach(function() {

    });

    it("Create instance", function() {
        var dataGrid = $($dataGrid).huskyDataGrid({
            url: '/data'
        });

        console.log(dataGrid);

        expect(dataGrid.data.length).toEqual(10);
    });
});