/*General tab-changing function. 
Hides all tabs and shows the chosen one*/
function changeToTab(tabId){
	var tabs = document.getElementById("sidebarContent").getElementsByClassName("sidebarView");
	for(var i = 0; i < tabs.length; i++){
		tabs[i].style.display = "none";
	}
	document.getElementById(tabId).style.display = "flex";
}

/*Change to the room view.*/
function changeToRoomTab(event){
	changeToTab("roomView");
}

/*Change to Objects view.*/
function changeToObjectsTab(event){
	changeToTab("objectsView");
}

function changeToPlayersTab(event){
	changeToTab("playersView");
}

document.addEventListener('DOMContentLoaded', function(e){
		document.getElementById("roomViewButton").addEventListener('click', changeToRoomTab);
		document.getElementById("objectsViewButton").addEventListener('click', changeToObjectsTab);
		document.getElementById("playersViewButton").addEventListener('click', changeToPlayersTab);
		changeToRoomTab(e);
	}
)