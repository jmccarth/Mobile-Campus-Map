function createPeopleList(){
	var itemList = dijit.byId("peopleList");
	var queryTask = new esri.tasks.QueryTask(peopleURL);
	var query = new esri.tasks.Query();
	query.outFields = ["FIRSTNAME", "LASTNAME","OBJECTID","SPACEID"];
	query.returnGeometry = false;
	query.where = "OBJECTID > 0";
	queryTask.execute(query,
		function(peopleFtrs){
			var peopleList = $('#peopleList');
			peopleList.empty();
			if(peopleFtrs.features.length == 0){
				var noResults = new dojox.mobile.ListItem({label: "No Results"});
				noResults.set("class", "mblVariableHeight");
				itemList.addChild(noResults);
			}
			else{
				//sort features alphabetically based on the building abbreviation
				peopleFtrs.features.sort(function(a,b){
					if (a.attributes.LASTNAME < b.attributes.LASTNAME){
						return -1;
					}
					else{
						return 1;
					}
				});
				
				$.each(peopleFtrs.features, function (index,feature){
					personName = feature.attributes.FIRSTNAME + " " + feature.attributes.LASTNAME;
					//Create the ListItem element
					var resultItem = new dojox.mobile.ListItem({label: personName, moveTo: "mapView", transition: 'slide'});
					//Allow the item to have a variable height (important for mobile devices)
					resultItem.set("class", "mblVariableHeight");
					itemList.addChild(resultItem);
					
					var showFtr = function(ftr){
						return function(){
							getOffice(ftr.attributes.SPACEID);
						}
					};
					dojo.connect(resultItem, "onClick", showFtr(feature))
				});
			}
		},
		function(evt){
			console.log(evt);
		}
	)
}


function getOffice(spaceID){
	var queryTask = new esri.tasks.QueryTask(intSpacesURL);
	var query = new esri.tasks.Query();
	query.outFields = ["*"];
	query.returnGeometry = true;
	query.where = "SPACEID LIKE '" + spaceID + "'";
	queryTask.execute(query,function(features){
		showOffice(features.features[0])	
	});	
}
			
function showOffice(feature){
	var interiorSpaceLayer = new esri.layers.FeatureLayer(intSpacesURL);
	roomSelectionLayer.clear();
	roomSelectionLayer.add(feature);
	map.setExtent(feature.geometry.getExtent().expand(2.5));
	destination = feature.geometry.getExtent().getCenter();
	dijit.byId('identInfo').domNode.textContent = feature.attributes.LONGNAME;
	floorNum = feature.attributes.FLOORID.charAt(feature.attributes.FLOORID.length - 1);
	changeFloors(floorNum);
	enableInfo();
	enableRouting();
}
/*
			
function getPerson(oid){
	var queryTask = new esri.tasks.QueryTask(peopleURL);
	var query = new esri.tasks.Query();
	query.outFields = ["*"];
	query.returnGeometry = true;
	query.where = "OBJECTID LIKE '" + oid + "'";
	queryTask.execute(query,function(features){
		showPerson(features.features[0])	
	});	
}
			
function showPerson(feature){
	peopleSelectionLayer.clear();
	peopleSelectionLayer.add(feature);
	map.centerAt(feature.geometry);
	map.setExtent(new esri.geometry.Extent(feature.geometry.x - 200, feature.geometry.y - 200, feature.geometry.x + 200, feature.geometry.y + 200, new esri.SpatialReference({wkid:3857})));
	destination = feature.geometry;
	dijit.byId('identInfo').domNode.textContent = feature.attributes.FIRSTNAME + " " + feature.attributes.LASTNAME
	enableInfo();
	enableRouting();
}*/