/**
		queryComputers(labFilter,computerFilter,successFunction)
	*/
function buildCompLabList(){
	xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET",compStatusXMLPath,false);
	xmlhttp.send();
	xmlDoc=xmlhttp.responseXML;
	comps = xmlDoc.getElementsByTagName("Computer");
	rooms = xmlDoc.getElementsByTagName("Room");
	//set up computer list
	
	
	var labList = dijit.byId('labList');
	while (labList.domNode.hasChildNodes()){
		labList.domNode.removeChild(labList.domNode.lastChild);
	}
	
	
	if(rooms.length == 0){
		var noResults = new dojox.mobile.ListItem({label: "No Results"});
		noResults.set("class", "mblVariableHeight");
		labList.addChild(noResults);
	}
	else{
		for (i = 0; i < rooms.length; i++){
			roomName = rooms[i].getAttribute("number");
			var numAvail = 0;
			for (k = 0; k < rooms[i].childNodes.length; k++){
				if (rooms[i].childNodes[k].getAttribute("status") != "Logged In"){
					numAvail++;
				}
			}
			itemLabel = roomName + " (" + numAvail + " out of " + rooms[i].childNodes.length + " available)";
			var resultItem = new dojox.mobile.ListItem({label: itemLabel});
			resultItem.set("class","mblVariableHeight");
			labList.addChild(resultItem);
			
		}
	}
}