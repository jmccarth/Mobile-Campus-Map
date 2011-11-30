/**
 * @author jmccarth
 */
function createBuildingList(){
	var itemList = dijit.byId("bldgList");
	var queryTask = new esri.tasks.QueryTask(bldgURL);
	var query = new esri.tasks.Query();
	query.outFields = ["SHORTNAME"];
	query.returnGeometry = false;
	query.where = "OBJECTID > 0";
	queryTask.execute(query,
		function(bldgFtrs){
			var bldgList = $('#bldgList');
			bldgList.empty();
			if(bldgFtrs.features.length == 0){
				var noResults = new dojox.mobile.ListItem({label: "No Results"});
				noResults.set("class", "mblVariableHeight");
				itemList.addChild(noResults);
			}
			else{
				//sort features alphabetically based on the building abbreviation
				bldgFtrs.features.sort(function(a,b){
					if (a.attributes.SHORTNAME < b.attributes.SHORTNAME){
						return -1;
					}
					else{
						return 1;
					}
				});
				
				$.each(bldgFtrs.features, function (index,feature){
					bldgName = feature.attributes.SHORTNAME;
					//Create the ListItem element
					var resultItem = new dojox.mobile.ListItem({label: bldgName, moveTo: "mapView", transition: 'slide'});
					//Allow the item to have a variable height (important for mobile devices)
					resultItem.set("class", "mblVariableHeight");
					itemList.addChild(resultItem);
					
					var showFtr = function(ftr){
						return function(){
							getBuilding(ftr.attributes.SHORTNAME);
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
			
function getBuilding(bldgAbbv){
	var queryTask = new esri.tasks.QueryTask(bldgURL);
	var query = new esri.tasks.Query();
	query.outFields = ["*"];
	query.returnGeometry = true;
	query.where = "SHORTNAME LIKE '" + bldgAbbv + "'";
	queryTask.execute(query,function(features){
		showBuilding(features.features[0])	
	});	
}
			
function showBuilding(feature){
	buildingSelectionLayer.clear();
	buildingSelectionLayer.add(feature);
	map.setExtent(feature.geometry.getExtent().expand(2.5));
	destination = feature.geometry.getExtent().getCenter();
	dijit.byId('identInfo').domNode.textContent = feature.attributes.SHORTNAME
	enableInfo();
	enableRouting();
}