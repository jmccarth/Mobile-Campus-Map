function initializeRoomView(){
	var bldgSelector = $("#bldgSelector");
	bldgSelector.empty();
	bldgSelector.append("<option label='---' value='---'></option>");
	bldgSelector.append("<option label='EV1' value='EV1'></option>");
	bldgSelector.append("<option label='EV2' value='EV2'></option>");
	bldgSelector.append("<option label='EV3' value='EV3'></option>");
}
		 
function buildFloorList(){
	buildingLayer = new esri.layers.FeatureLayer(bldgURL);
	var floorSelector = $("#floorSelector");
	floorSelector.empty();
	floorSelector.append("<option label='---' value='---'></option>")
	// Create a floor list
	bldgAbbv = document.getElementById("bldgSelector").value;
	
	var queryTask = new esri.tasks.QueryTask(bldgURL);
	var query = new esri.tasks.Query();
	query.outFields = ["*"];
	query.returnGeometry = true;
	query.where = "SHORTNAME LIKE '" + bldgAbbv + "'";
	queryTask.execute(query,function(features){
		floorQuery = new esri.tasks.RelationshipQuery();
		floorQuery.outFields = ["*"];
		floorQuery.relationshipId = 3;
		floorQuery.objectIds = [features.features[0].attributes.OBJECTID];
		
		buildingLayer.queryRelatedFeatures(floorQuery,
			function(relatedRecords){
				//sort features alphabetically based on the building abbreviation
				relatedRecords[features.features[0].attributes.OBJECTID].features.sort(function(a, b){
					if (a.attributes.VERTORDER < b.attributes.VERTORDER) {
						return -1;
					}
					else {
						return 1;
					}
				});
				
				dojo.forEach(relatedRecords[features.features[0].attributes.OBJECTID].features,function(feature){
					floorNum = feature.attributes.VERTORDER;
					floorSelector.append("<option label='" + floorNum + "' value='" + feature.attributes.OBJECTID + "'></option>")
				});
					
			},
			function (evt){
				console.log(evt);
			}
		);
	});	
}


function createRoomList(){
	var roomList = $('#roomList');
	roomList.empty();
			
	//get selected value of floor OID
	floorOID = document.getElementById("floorSelector").value
	floorLayer = new esri.layers.FeatureLayer(floorURL);
	
	var roomQuery = new esri.tasks.RelationshipQuery();
	roomQuery.outFields = ["*"];
	roomQuery.relationshipId = 2;
	roomQuery.objectIds = [floorOID];
	roomQuery.returnGeometry = true;
	
	changeFloors(document.getElementById("floorSelector")[document.getElementById("floorSelector").selectedIndex].text);
	
	floorLayer.queryRelatedFeatures(roomQuery,
		function(relatedRecords){
			var itemList = dijit.byId("roomList");
			if (relatedRecords[floorOID].features.length == 0) {
				var noResults = new dojox.mobile.ListItem({
					label: "No Results"
				});
				noResults.set("class", "mblVariableHeight");
				itemList.addChild(noResults);
			}
			else {
				//sort features alphabetically based on the building abbreviation
				relatedRecords[floorOID].features.sort(function(a, b){
					if (a.attributes.SHORTNAME < b.attributes.SHORTNAME) {
						return -1;
					}
					else {
						return 1;
					}
				});
				
				$.each(relatedRecords[floorOID].features, function(index, feature){
					roomName = feature.attributes.SHORTNAME;
					//Create the ListItem element
					var resultItem = new dojox.mobile.ListItem({
						label: roomName,
						moveTo: "mapView",
						transition: 'slide'
					});
					//Allow the item to have a variable height (important for mobile devices)
					resultItem.set("class", "mblVariableHeight");
					itemList.addChild(resultItem);
					
					var showFtr = function(ftr){
						return function(){
							getRoom(ftr.attributes.SPACEID);
							
						}
					};
					dojo.connect(resultItem, "onClick", showFtr(feature))
				});
			}
		},
		function(evt){
			console.log(evt);
		}
	);
}
			
function getRoom(spaceID){
	var queryTask = new esri.tasks.QueryTask(intSpacesURL);
	var query = new esri.tasks.Query();
	query.outFields = ["*"];
	query.returnGeometry = true;
	query.where = "SPACEID LIKE '" + spaceID + "'";
	queryTask.execute(query,function(features){
		showRoom(features.features[0])	
	});	
}
			
function showRoom(feature){
	var interiorSpaceLayer = new esri.layers.FeatureLayer(intSpacesURL);
	roomSelectionLayer.clear();
	roomSelectionLayer.add(feature);
	map.setExtent(feature.geometry.getExtent().expand(2.5));
	destination = feature.geometry.getExtent().getCenter();
	
	//Build information list about the room from the space report
	//Use the relationship class to get the related record in the space report
	var spaceReportQuery = new esri.tasks.RelationshipQuery();
	
	spaceReportQuery.outFields = ["*"]; //This is causing it to fail								
	//spaceReportQuery.outFields = ["Control_Dept", "ASF", "NSF"]; //It seems like fields belonging to relationships don't work
	spaceReportQuery.relationshipId = 11;
	spaceReportQuery.objectIds = [feature.attributes.OBJECTID];

	interiorSpaceLayer.queryRelatedFeatures(spaceReportQuery, 
		function(relatedRecords){
			rec_set = relatedRecords[feature.attributes.OBJECTID];
			desc = "Owner:" + rec_set.features[0].attributes.Control_Dept + "\nRM_SHARE_STD_NM: " + rec_set.features[0].attributes.RM_SHARE_STD_NM + "\nFunction Code:" + rec_set.features[0].attributes.Function_Code + "\nASF: " + rec_set.features[0].attributes.ASF + "\nNSF: " + rec_set.features[0].attributes.NSF + "\nLengthIMP: " + rec_set.features[0].attributes.LengthIMP + "\nWidthIMP: " + rec_set.features[0].attributes.WidthIMP + "\nWheelchair: " + rec_set.features[0].attributes.Whlchr + "\nBookable: " + rec_set.features[0].attributes.Bkbl + "\nMax Occupancy: " + rec_set.features[0].attributes.Max_occ;
			dijit.byId('identInfo').anchorNode.innerText = desc;
		},
		function(evt){
			console.log(evt);
		}
	);
	
	enableInfo();
	enableRouting();
}

function changeFloors(floor){
	roomsLayer.setDefinitionExpression("SPACEID LIKE '%$_" + floor + "%' ESCAPE '$'");
}

