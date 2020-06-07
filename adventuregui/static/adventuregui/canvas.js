var allNodes = [];
var startExitNode = null;
var dragPath = null;

function newNode(position){
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
	nodeGroup.exitNodes = [];

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
	nodeGroup.exitNodes.push(east);
	nodeGroup.exitNodes.push(north);
	nodeGroup.exitNodes.push(west);
	nodeGroup.exitNodes.push(south);
	nodeGroup.addChildren([east, north, west, south]);
	allNodes.push(nodeGroup);
	return nodeGroup;
}

function newExitNode(position){
	var exitNode = new Path.Circle({
		center : position,		// Position of exit node on canvas
		radius : 10,			// Size of canvas
		fillColor : 'black',	// Fill color
		exit : [],				// Reference to the exit node
		});
	
	exitNode.onMouseEnter = function(event){
		this.fillColor = 'red'; 
	}
	exitNode.onMouseLeave = function(event){
		this.fillColor = 'black'; 
	}

	exitNode.onMouseDown = function(event){
		var startPos = new Point(exitNode.center);
		var endPos = new Point(exitNode.center);
		dragPath = new Path([startPos, endPos]);
		dragPath.strokeColor = 'black';
		dragPath.strokeWidth = 3;
		startExitNode = this;							// Set start dragging
	}
	exitNode.onMouseDrag = function(event){
		if(dragPath != null){
			var PATH_SNAP_DIST = 15;
			dragPath.segments = [exitNode.position, event.point];
			var nearestExit = getNearestExitNode(event.point);
			var dist = (nearestExit.position - event.point).length;
			if(dist < PATH_SNAP_DIST & nearestExit != exitNode){
				console.log(dist);				
			}
		}
	}

	exitNode.onMouseUp = function(event){
		var nearestExit = getNearestExitNode(event.point);
		if(nearestExit != null & nearestExit != exitNode & nearestExit.parent != exitNode.parent){
			var edgePath = genEdgePath(exitNode.position, nearestExit.position);
		}

		if(dragPath != null){
			dragPath.remove();
			dragPath = null;
		}
	}
	return exitNode;
}

function genEdgePath(startPos, endPos){
	var edgePath = new Path([startPos, endPos]);
	edgePath.strokeColor = 'green';
	edgePath.strokeWidth = 3;
}

/* Gets the nearest exit node from a given node. */
function getNearestExitNode(position){
	currentMin = 100000000;	// Minimum distance so far
	nearNode = null;		// Nearest node to return
	for(var i = 0; i < allNodes.length; i++){
		var exitNodes = allNodes[i].exitNodes;
		for(var j = 0; j < exitNodes.length; j++){
			var dist = (exitNodes[j].position - position).length
			if(dist < currentMin){
				currentMin = dist;
				nearNode = exitNodes[j];
			}
		}
	}
	return nearNode;
}

function genNewNodeButton(view){
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