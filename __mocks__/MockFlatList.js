const React = require('react');

function MockFlatList({data = [], renderItem}) {
    return React.createElement(
        'FlatList',
        {testID: 'flat-list'},
        data.map((item, index) =>
            React.createElement(
                'FlatListItemWrapper',
                {key: item.icao || index},
                renderItem({item, index}),
            )
        ),
    );
}

module.exports = MockFlatList;
module.exports.default = MockFlatList;
