/**
 * @author jmccarth
 */

 function createFacultyList(){
 	var itemList = dijit.byId("facultyList");
	var facList = $('#facultyList');
	facList.empty();
 	queryTask = new esri.tasks.QueryTask(facURL);
		
	//build the query, including the facultyName if one exists
	query = new esri.tasks.Query();
	query.outFields = ["Faculty"]; 
	query.where = "OBJECTID > 0"; 
	
	queryTask.execute(query, 
		function(recs){
			
			if(recs.features.length == 0){
				var noResults = new dojox.mobile.ListItem({label: "No Results"});
				noResults.set("class", "mblVariableHeight");
				itemList.addChild(noResults);
			}
			else{
				//sort features alphabetically based on the building abbreviation
				recs.features.sort(function(a,b){
					if (a.attributes.Faculty < b.attributes.Faculty){
						return -1;
					}
					else{
						return 1;
					}
				});
				
				$.each(recs.features, function (index,feature){
					facName = feature.attributes.Faculty;
					//Create the ListItem element
					var resultItem = new dojox.mobile.ListItem({label: facName, moveTo: "departmentView", transition: 'slide'});
					//Allow the item to have a variable height (important for mobile devices)
					resultItem.set("class", "mblVariableHeight");
					itemList.addChild(resultItem);
					dojo.connect(resultItem,"onClick",function(){createDepartmentList(feature.attributes.Faculty)});
				});
			}
		},
		function(error){
			console.log(error);
		}
	);
 }
 
 function createDepartmentList(facName){
 	var itemList = dijit.byId("departmentList");
	var deptList = $('#departmentList');
	deptList.empty();
 	queryTask = new esri.tasks.QueryTask(deptURL);
		
	//build the query, including the facultyName if one exists
	query = new esri.tasks.Query();
	query.outFields = ["Subject"]; 
	query.where = "First_Faculty LIKE '" + facName + "'"; 
	
	queryTask.execute(query, 
		function(recs){
			
			if(recs.features.length == 0){
				var noResults = new dojox.mobile.ListItem({label: "No Results"});
				noResults.set("class", "mblVariableHeight");
				itemList.addChild(noResults);
			}
			else{
				//sort features alphabetically based on the building abbreviation
				recs.features.sort(function(a,b){
					if (a.attributes.Subject < b.attributes.Subject){
						return -1;
					}
					else{
						return 1;
					}
				});
				
				$.each(recs.features, function (index,feature){
					deptName = feature.attributes.Subject;
					//Create the ListItem element
					var resultItem = new dojox.mobile.ListItem({label: deptName, moveTo: "courseView", transition: 'slide'});
					//Allow the item to have a variable height (important for mobile devices)
					resultItem.set("class", "mblVariableHeight");
					itemList.addChild(resultItem);
					dojo.connect(resultItem,"onClick",function(){createCourseList(feature.attributes.Subject)});
				});
			}
		},
		function(error){
			console.log(error);
		}
	);
 }
 
 function createCourseList(deptName){
 	var itemList = dijit.byId("courseList");
	var courseList = $('#courseList');
	courseList.empty();
 	queryTask = new esri.tasks.QueryTask(coursesURL);
		
	//build the query, including the facultyName if one exists
	query = new esri.tasks.Query();
	query.outFields = ["*"]; 
	//TODO: Make term choosable
	query.where = "Subject LIKE '" + deptName + "' AND Term = 1119"; 
	
	queryTask.execute(query, 
		function(recs){
			
			if(recs.features.length == 0){
				var noResults = new dojox.mobile.ListItem({label: "No Results"});
				noResults.set("class", "mblVariableHeight");
				itemList.addChild(noResults);
			}
			else{
				//sort features alphabetically based on the building abbreviation
				recs.features.sort(function(a,b){
					if (a.attributes.Catalog_Nbr < b.attributes.Catalog_Nbr){
						return -1;
					}
					else{
						return 1;
					}
				});
				
				$.each(recs.features, function (index,feature){
					courseName = feature.attributes.Subject + " " + feature.attributes.Catalog_Nbr + " (Section " + feature.attributes.Section + ")";
					//Create the ListItem element
					var resultItem = new dojox.mobile.ListItem({label: courseName, moveTo: "mapView", transition: 'slide'});
					//Allow the item to have a variable height (important for mobile devices)
					resultItem.set("class", "mblVariableHeight");
					itemList.addChild(resultItem);
					//TODO: Show feature (either room or building depending on available data)
					dojo.connect(resultItem,"onClick",function(){showCourseLoc(feature.attributes.OBJECTID)});
				});
			}
		},
		function(error){
			console.log(error);
		}
	);
 }

function showCourseLoc(OID){
	var bldg = null;
	var room = null;
	var bldgID = null;
	
	queryTask = new esri.tasks.QueryTask(coursesURL);
		
	//build the query, including the facultyName if one exists
	query = new esri.tasks.Query();
	query.outFields = ["Bldg","Room","Subject","Catalog_Nbr","Section","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]; //TODO: Probably want days and times too so they can be shown
	//TODO: Make term choosable
	query.where = "OBJECTID = " + OID; 
	
	queryTask.execute(query,
		function(recs){
			if (recs.features.length == 0) {
				//Something must have gone wrong
			}
			else{
				if (recs.features[0].attributes.Bldg != null){
					bldg = recs.features[0].attributes.Bldg;
				}
				if (recs.features[0].attributes.Room != null){
					room = recs.features[0].attributes.Room;
				}
				
				//search for the building and the room
				if (bldg == null && room == null){
					dijit.byId('identInfo').domNode.textContent = "Course location unknown";
					enableInfo();
				}
				else{
					//query building
					var queryTask = new esri.tasks.QueryTask(bldgURL);
					var query = new esri.tasks.Query();
					query.outFields = ["SHORTNAME","BUILDINGID"];
					query.returnGeometry = true;
					query.where = "SHORTNAME LIKE '" + bldg + "'";
					queryTask.execute(query,function(features){
						showBuilding(features.features[0]); //TODO: Taking this from buildings.js for now
						bldgID = features.features[0].attributes.BUILDINGID;
						
						//query room
						var roomQueryTask = new esri.tasks.QueryTask(intSpacesURL);
						var roomQuery = new esri.tasks.Query();
						roomQuery.outFields = ["*"];
						roomQuery.returnGeometry = true;
						spaceID = bldgID + "_" + room;
						roomQuery.where = "SPACEID LIKE '" + spaceID + "'";
						roomQueryTask.execute(roomQuery,function(features){
							if (features.features.length != 0){
								showRoom(features.features[0]);
								//dijit.byId('identInfo').domNode.textContent = "Held In: " + features.features[0].attributes.SHORTNAME + " " + features.features[0].attributes.Room;					
							}
						});
					});
					
				}
			}
		},
		function(error){
			console.log(error);
		}
	);
}

function showRoom(feature){
	roomSelectionLayer.clear();
	roomSelectionLayer.add(feature);
	map.setExtent(feature.geometry.getExtent().expand(2.5));
	destination = feature.geometry.getExtent().getCenter();
	dijit.byId('identInfo').domNode.textContent = "Something interesting about the course should go here" //TODO: this should probably be populated when the course is selected, from the attributes of the course.  Then room and building can be shown regardless of if we have the features
	enableInfo();
	enableRouting();
}
 