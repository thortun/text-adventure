var colorPalette = {		// https://flatuicolors.com/palette/gb
	blue 		: "#00a8ff",
	dblue 		: "#0097e6",
	purple 		: "#9c88ff",
	dpurple 	: "#8c7ae6",
	yellow 		: "#fbc531",
	dyellow 	: "#e1b12c",
	green 		: "#4cd137",
	dgreen 		: "#44bd32",
	seablue 	: "#487eb0",
	dseablue 	: "#40739e",
	orange 		: "#e84118",
	dorange 	: "#c23616",
	white 		: "#f5f6fa",
	dwhite 		: "#dcdde1",
	greyblue 	: "#7f8fa6",
	dgreyblue 	: "#718093",
	deepblue 	: "#273c75",
	ddeepblue 	: "#192a56",
	dark 		: "#353b48",
	ddark 		: "#2f3640",
};

var allExits = [];			// Array of all exit nodes
var dragPath = null;		// Ephemeral path indicating dragging
var zoomFactor = 1;			// Current zoom level
var selectArray = [];		// Array of selected nodes
var allNodes = [];

function newDragRectangle(position){
	var dragRectangle = new Path.Rectangle({
		topLeft : position,
		fillColor : 'black',
		size : new Size(15, 15)
	})
	dragRectangle.onMouseDrag = function (event){
		if(selectGroup){
			selectGroup.translate(event.delta);
			for(var i = 0; i < selectGroup.children.length; i++){
				selectGroup.children[i].update();
			}
		}
		else{
			dragRectangle.parent.position += event.delta;	// Change the position of the node
			dragRectangle.parent.update();					// Update the node
		}
	}

	return dragRectangle;
}

function newRoom(roomData){
	var roomPosition = new Point(roomData.position[0], roomData.position[1]);
	var backgroundPath = new Path.Rectangle({
		center : roomPosition,
		size : new Size(100, 100),
		strokeColor : 'black',
		fillColor : colorPalette.orange,
		strokeWidth : 3,
	});
	/* OTHER PROPERTIES */
	backgroundPath.name = roomData.name || "New Room";
	backgroundPath.description = roomData.description || "Description.";

	backgroundPath.onMouseUp = function(event){
		if(event.target === this){
			globals.editObject = this;
			document.getElementById("nodeTitle").value = backgroundPath.name;
			document.getElementById("nodeDescription").value = backgroundPath.description;
		}
	}

	backgroundPath.onMouseDrag = function(event){
		if(selectArray.length > 0 && selectArray.includes(backgroundPath.parent)){
			for(var i = 0; i < selectArray.length; i++){
				selectArray[i].translate(event.delta);
				selectArray[i].update();
			}
		}
		else{
			for(var i = 0; i < selectArray.length; i++){
				selectArray[i].onDeselect();
			}
			selectArray = [];
			backgroundPath.parent.translate(event.delta);
			backgroundPath.parent.update();
		}
	}

	var nodeGroup = new Group([backgroundPath]);
	nodeGroup.background = backgroundPath;

	nodeGroup.update = function(){
		nodeGroup.eastExit.update();
		nodeGroup.northExit.update();
		nodeGroup.westExit.update();
		nodeGroup.southExit.update();
	}

	nodeGroup.onSelect = function(){
		nodeGroup.background.fillColor = colorPalette.dorange;
	}

	nodeGroup.onDeselect = function(){
		nodeGroup.background.fillColor = colorPalette.orange;
	}

	nodeGroup.eastExit = newEmptyExit(new Point(backgroundPath.bounds.rightCenter));
	nodeGroup.northExit = newEmptyExit(new Point(backgroundPath.bounds.topCenter));
	nodeGroup.westExit = newEmptyExit(new Point(backgroundPath.bounds.leftCenter));
	nodeGroup.southExit = newEmptyExit(new Point(backgroundPath.bounds.bottomCenter));
	nodeGroup.addChildren([nodeGroup.eastExit, nodeGroup.northExit, nodeGroup.westExit, nodeGroup.southExit]);
	allExits.push(nodeGroup.eastExit, nodeGroup.northExit, nodeGroup.westExit, nodeGroup.southExit);
	nodeLayer.addChild(nodeGroup);
	allNodes.push(nodeGroup);
	nodeGroup.scale(zoomFactor);
	return nodeGroup;
}

function newEmptyExit(position){
	var exitNode = new Path.Circle({
		center : position,				// Position of exit node on canvas
		radius : 10,					// Size of canvas
		fillColor : colorPalette.dark,	// Fill color
	});
	exitNode.exit = null;				// No exit yet
	exitNode.entrance = null;			// No entrance yet
	exitNode.exitPath = null;			// No path yet;

	exitNode.onMouseEnter = function(event){
		this.fillColor = colorPalette.ddark;
	}

	exitNode.onMouseLeave = function(event){
		this.fillColor = colorPalette.dark; 
	}

	exitNode.onMouseDown = function(event){
		var startPos = new Point(exitNode.center);
		var endPos = new Point(exitNode.center);
		dragPath = new Path([startPos, endPos]);
		dragPath.strokeColor = 'black';
		dragPath.strokeWidth = 3;
		startExitNode = this;
	}

	exitNode.onMouseDrag = function(event){
		if(event.modifiers.shift){
			exitNode.translate(event.delta);	// Move the node

		}
		else{
			if(dragPath != null){
				dragPath.segments = [exitNode.position, event.point];
				var nearestExit = getNearestExitNode(event.point);
			}
		}
	}

	exitNode.onMouseUp = function(event){
		var PATH_SNAP = 20;
		var nearestExit = getNearestExitNode(event.point);
		var d = (nearestExit.position - event.point).length;
		if(nearestExit != null & nearestExit != exitNode & nearestExit.parent != exitNode.parent & d <= PATH_SNAP){
			linkExits(exitNode, nearestExit);
		}
		if(dragPath != null){
			dragPath.remove();
			dragPath = null;
		}
	}

	exitNode.update = function(){
		if(exitNode.exitPath){
			exitNode.exitPath.update();
		}
	}
	return exitNode;
}

function linkExits(startNode, endNode){
	startNode.exit = endNode;
	endNode.entrance = startNode;
	var exitPath = newEdgePath(startNode, endNode);
	startNode.exitPath = exitPath;
	endNode.exitPath = exitPath;
}

function newEdgePath(startNode, endNode){
	var edgePath = new Path([startNode.position, endNode.position]);
	edgePath.strokeColor = colorPalette.deepblue;
	edgePath.strokeWidth = 3;
	edgePath.startNode = startNode;
	edgePath.endNode = endNode;

	edgePath.onMouseEnter = function(event){
		edgePath.strokeWidth = 5;
	}

	edgePath.onMouseLeave = function(event){
		edgePath.strokeWidth = 3;
	}

	edgePath.onMouseDown = function(event){
		if(event.modifiers.control){
			edgePath.onRemove();
			edgePath.remove();
		}
	}

	edgePath.update = function(){
		var start = edgePath.startNode.position;
		var end = edgePath.endNode.position;
		edgePath.segments = [start, end];
	}
	/*Called before removing the path*/
	edgePath.onRemove = function(){
		startNode.exit = null;
		endNode.entrance = null;
	}

	nodeLayer.addChild(edgePath);
	return edgePath;
}

/* Gets the nearest exit node from a given node. */
function getNearestExitNode(position){
	currentMin = 100000000;	// Minimum distance so far
	nearNode = null;		// Nearest node to return
	for(var i = 0; i < allExits.length; i++){
		var dist = (allExits[i].position - position).length
		if(dist < currentMin){
			currentMin = dist;
			nearNode = allExits[i];
		}
	}
	return nearNode;
}

function genNewRoomButton(view){
	button = new Path.Rectangle({
		size : new Size(150, 30),
		fillColor : 'black',
		bottomLeft : view.bounds.bottomLeft,
	});
	button.onMouseDown = function(event){
		newRoom({position : [view.bounds.center.x, view.bounds.center.y]});
	}
	return button;
}

function zoomLayer(layer, event){
	var scaleFactor = 1 - event.deltaY / 1000;
	if(zoomFactor * scaleFactor <= 2 && event.shiftKey){
		zoomFactor *= scaleFactor;
		layer.scale(scaleFactor);
	}
}

function newBackgroundLayer(){
	var backgroundLayer = new Layer();
	backgroundLayer.addChild(new Path.Rectangle({
		size : view.size,
		center : view.center,
		fillColor : new Color(0, 0, 0, 0.001),
	}));
	var selectRect = new Rectangle({
		center : view.center,
		size : new Size(0, 0),
		strokeColor : 'black',
		strokeWidth : 2,
	});
	backgroundLayer.addChild(backgroundLayer.selectRect);
	backgroundLayer.selectRect = selectRect;
	backgroundLayer.selectPath = null;

	backgroundLayer.onMouseDown = function(e){
		if(selectArray.length > 0){
			for(var i = 0; i < selectArray.length; i++){
				selectArray[i].onDeselect();
			}
		selectArray = [];	// Clear array
		}
		backgroundLayer.selectRect.topLeft = e.point;
	}

	backgroundLayer.onMouseDrag = function(e){
		if(e.modifiers.shift){
			nodeLayer.translate(e.delta);
		}
		else{
			if(backgroundLayer.selectPath){
				backgroundLayer.selectPath.remove();
			}
			var newSize = new Size(e.point.x - backgroundLayer.selectRect.topLeft.x, e.point.y - backgroundLayer.selectRect.topLeft.y);
			backgroundLayer.selectRect.size = newSize;
			backgroundLayer.selectPath = new Path.Rectangle(backgroundLayer.selectRect);
			backgroundLayer.selectPath.strokeColor = 'black';
			backgroundLayer.selectPath.strokeWidth = 2;
		}
	}

	backgroundLayer.onMouseUp = function(e){
		if(backgroundLayer.selectPath){
			selectGroup = new Group();					// Reset the drag grouo
			for(var i = 0; i < allNodes.length; i++){	// Iterate over all nodes
				if(allNodes[i].isInside(backgroundLayer.selectRect)){	// If it is inside the rectangle
					allNodes[i].onSelect();
					selectArray.push(allNodes[i]);
				}
			}
			backgroundLayer.selectPath.remove();
			backgroundLayer.selectRect = new Rectangle();
		}
	}
	return newBackgroundLayer;
}

function loadFromFile(obj){
	roomList = [];
	roomDict = {};
	/* Setup room nodes */
	for(var i = 0; i < obj.rooms.length; i++){
		var createdRoom = newRoom(obj.rooms[i]);
		roomDict[obj.rooms[i]._id] = createdRoom;
		roomList.push(createdRoom);
	}
	/* Setup exit edges */
	for(var i = 0; i < obj.rooms.length; i++){
		if(obj.rooms[i].eastExit){
			var roomLink = obj.rooms[i].eastExit.roomLink;
			var exitLink = obj.rooms[i].eastExit.exitLink;
			linkExits(roomList[i].eastExit, roomDict[roomLink][exitLink]);
		}
		if(obj.rooms[i].northExit){
			var roomLink = obj.rooms[i].northExit.roomLink;
			var exitLink = obj.rooms[i].northExit.exitLink;
			linkExits(roomList[i].northExit, roomDict[roomLink][exitLink]);
		}
		if(obj.rooms[i].westExit){
			var roomLink = obj.rooms[i].westExit.roomLink;
			var exitLink = obj.rooms[i].westExit.exitLink;
			linkExits(roomList[i].westExit, roomDict[roomLink][exitLink]);
		}
		if(obj.rooms[i].southExit){
			var roomLink = obj.rooms[i].southExit.roomLink;
			var exitLink = obj.rooms[i].southExit.exitLink;
			linkExits(roomList[i].southExit, roomDict[roomLink][exitLink]);
		}
	}
}

function saveState(){
	
}

var backgroundLayer = newBackgroundLayer();
var nodeLayer = new Layer();
var UILayer = new Layer();

genNewRoomButton(view);
var canvas = document.getElementById("myCanvas").addEventListener('wheel', function(event){zoomLayer(nodeLayer, event);})

var file = {
	rooms : [
		{
			name : "Forest Floor",
			_id : "0",
			position : [200, 200],
			eastExit : {
				roomLink : "1",				// The id of the room this exit linked to
				exitLink : "westExit",		// Which node on the room is linked
			},
		},
		{
			name : "Forest Passage",
			_id : "1",
			position : [400, 200],
			southExit : {
				roomLink : "2",
				exitLink : "northExit",
			}
		},
		{
			name : "Forest Exit",
			_id : "2",
			position : [400, 400],
		}
	],
	startRoomId : "0"
}

loadFromFile(file);