var allNodes = [];

function newNode(position)
{
	var node = new Path.Rectangle({
		center : new Point(position),
		size : new Size(100, 100),
		strokeColor : 'black',
		fillColor : '#F9E1E0',
		strokeWidth : 3,
	});

	node.onMouseEnter = function(event){
		node.fillColor = '#FDAEB9';
	}

	node.onMouseLeave = function (event){
		node.fillColor = '#F9E1E0';
	}

	var nodeGroup = new Group([node]);

	var bounds = node.bounds;
	var dragRectangle = new Path.Rectangle({
		topLeft : bounds.topLeft,
		fillColor : 'black',
		size : new Size(15, 15)
	})
	dragRectangle.onMouseDrag = function (event){
		this.parent.position += event.delta;
	}

	nodeGroup.addChild(dragRectangle);
	var east = newExitNode(new Point(bounds.rightCenter));
	var north = newExitNode(new Point(bounds.topCenter));
	var west = newExitNode(new Point(bounds.leftCenter));
	var south = newExitNode(new Point(bounds.bottomCenter));
	nodeGroup.addChildren([east, north, west, south]);
	allNodes.push(nodeGroup);
	return nodeGroup;
}

function newExitNode(position)
{
	var exitNode = new Path.Circle({
		center : position,
		radius : 5,
		fillColor : 'black',
		});
	exitNode.onMouseEnter = function(event){ this.fillColor = 'red'; };
	exitNode.onMouseLeave = function(event){ this.fillColor = 'black'; };
	exitNode.onMouseDrag = function(event){
		for(var i = 0; i < allNodes.length; i++){
			if( (allNodes[i].position - event.point).length < 5 && this != allNodes[i]){
				console.log((allNodes[i].position - event.point).length);
			}
		}
	}
	exitNode.onMouseUp = function(event){
		console.log(allNodes.length);
	}
	return exitNode;
}

function genNewNodeButton(view)
{
	button = new Path.Rectangle({
		size : new Size(150, 30),
		fillColor : 'black',
		bottomLeft : view.bounds.bottomLeft,
	});
	button.onMouseDown = function(event){
		newNode(view.bounds.center);
	}
	return button;
}

var firstNode = newNode(view.center);
var secondNode = newNode(view.center + new Point(150, 50));
var button = genNewNodeButton(view);





