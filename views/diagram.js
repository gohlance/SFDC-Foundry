diagram = (function(){
    var $ = go.GraphObject.make;
    var diagram;
    var initDiagram = function () {
        diagram = $(go.Diagram, 
            'diagram-content', {
                initialContentAlignment: go.Spot.Center
        });
    }

    diagram.model = $(go.GraphLinksModel, {
        nodeDataArray: [
            {key: 1, category: 'first'},
            {key: 2, category: 'second'},
            {key: 3, category: 'second'},
            {key: 4, category: 'third'}
        ],
        linkDataArray: [
            {from: 1, to: 2},
            {from: 2, to: 3},
            {from: 1, to: 3},
            {from: 3, to: 4}
        ]
    });
    
    diagram.nodeTemplate = $(go.Node, 'Auto', $(go.Shape, 'Circle'));
    
    diagram.nodeTemplate = $(go.Node,
        'Auto',
        $(go.Shape, {
            geometryString: 'F M0 0 L100 0 Q150 50 100 100 L0 100 Q50 50 0 0z',
            fill: 'white',
            width: 100,
            height: 100
        }));

    return { initDiagram };
})();

