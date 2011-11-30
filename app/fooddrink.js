function createFoodDrinkList(){
	var itemList = dijit.byId("foodList")
	var queryTask = new esri.tasks.QueryTask(foodURL);
	var query = new esri.tasks.Query();
	query.outFields = ["Food_Services"];
	query.returnGeometry = false;
	query.where = "OBJECTID > 0";
	queryTask.execute(query,
		function(fdFtrs){
			var foodList = $('#foodList');
			foodList.empty();
			if(fdFtrs.features.length == 0){
				var noResults = new dojox.mobile.ListItem({label: "No Results"});
				noResults.set("class", "mblVariableHeight");
				itemList.addChild(noResults);
			}
			else{
				//sort features alphabetically based on the building abbreviation
				fdFtrs.features.sort(function(a,b){
					if (a.attributes.Food_Services < b.attributes.Food_Services){
						return -1;
					}
					else{
						return 1;
					}
				});
				
				$.each(fdFtrs.features, function (index,feature){
					fdName = feature.attributes.Food_Services;
					//Create the ListItem element
					var resultItem = new dojox.mobile.ListItem({label: fdName, moveTo: "mapView", transition: 'slide'});
					//Allow the item to have a variable height (important for mobile devices)
					resultItem.set("class", "mblVariableHeight");
					itemList.addChild(resultItem);
					
					var showFtr = function(ftr){
						return function(){
							getFoodLoc(ftr.attributes.Food_Services);
						}
					};
					dojo.connect(resultItem, "onClick", showFtr(feature))
				});
			}
		},
		function(evt){
			console.log(evt);
		});
}

function getFoodLoc(fsName){
	var queryTask = new esri.tasks.QueryTask(foodURL);
	var query = new esri.tasks.Query();
	query.outFields = ["*"];
	query.returnGeometry = true;
	query.where = "Food_Services LIKE '" + fsName + "'";
	queryTask.execute(query,function(features){
		showFoodLoc(features.features[0])	
	});		
}

function showFoodLoc(feature){
	fdSelectionLayer.clear();
	fdSelectionLayer.add(feature);
	map.centerAt(feature.geometry);
	map.setExtent(new esri.geometry.Extent(feature.geometry.x - 200, feature.geometry.y - 200, feature.geometry.x + 200, feature.geometry.y + 200, new esri.SpatialReference({wkid:3857})));
	destination = feature.geometry;
	dijit.byId('identInfo').domNode.textContent = feature.attributes.Food_Services
	enableInfo();
	enableRouting();
}