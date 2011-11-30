/**
 * @author jmccarth
 */
function toggleLocator(){
	if (locatorPID == -1){ //locator is off
			//check if locator functionality works on this browser
			if(navigator.geolocation){ //locator works
				//locator is not on, turn it on and set locator process ID
				locatorPID = setInterval("retrievePos()",interval);
				dojo.byId('toggleLocator').src = "img/loc_on.png";
			}
			else{ //locator does not work on this browser
				alert("Functionality not available");
				//TODO: should probably disable locator button for the rest of the session
			}
		}
		else{
			//locator is on, so turn it off and set the locator process ID to -1
			clearInterval(locatorPID);
			locatorPID = -1;
			dojo.byId('toggleLocator').src = "img/loc_off.png";
			
			//Need to clear locator symbol
			if(prj_graphic != null){
				map.graphics.remove(prj_graphic);
			}
		}
	}
	
	/**
		resetLocator()
		
		Stops and starts the locator process.  Used when someone changes the GPS sampling
		interval they want to use.
	*/
	function resetLocator(){
		clearInterval(locatorPID);
		locatorPID = setInterval("retrievePos()",interval);
	}
	
	/**
		retrievePos()
	
		Uses ESRI JS API function to get position of current device.
	*/
	function retrievePos(){
		//check if the navigator object has been initialized
		//if initialized, get the current location
		//call the success function if the position is retrieved, and the error function if it fails
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(getPos_success,getPos_error,{enableHighAccuracy:true});
		}
	}
	
	/**
		getPos_success(p)
		p: the position object returned from getCurrentPosition
		
		Called when getCurrentPosition succeeds.  Stores the WGS84 lat/long of the position
		in two variables and calls the showLocation function.
	*/
	function getPos_success(p)
	{		
		//Get lat/long from p object returned from getCurrentPosition
		c_lat = p.coords.latitude;
		c_long = p.coords.longitude;
		//alert(p.coords.altitude);
		//c_elev = p.coods.altitude
		c_elev = 0;
		c_acc = p.coords.accuracy;
		
		//Show the position on the map
		showLocation(c_long,c_lat,c_elev,c_acc);
	}
	
	/**
		getPos_error(p)
		p: the position object returned from getCurrentPosition
		
		Called when something goes wrong with getCurrentPosition and alerts the user.
		In this case the position object will contain error information.
	*/
	function getPos_error(p)
	{
		console.log(p.message);
		dojo.byId('toggleLocator').src = "img/loc_err.png";
	}	
	
	/**
		showLocation(c_long,c_lat)
		c_long: The longitude of the coordinate to be displayed on the map
		c_lat: The latitude of the coordinate to be displayed on the map
		
		Takes the supplied x,y point (in WGS84), projects it, and displays it on the map.
		
	*/
	function showLocation(c_long,c_lat,c_elev,c_acc) {
		//Create a new point in WGS84 with the supplied x,y
		var pt = new esri.geometry.Point(c_long,c_lat,new esri.SpatialReference({wkid:4326}));
		
		//The point must be projected to the map's coordinate system (EPSG:26917, which is UTM Zone 17N NAD83)
		//So a GeometryService is created for this purpose
		//TODO: Set up a GeometryService on envmaps and point to that instead
		gsvc = new esri.tasks.GeometryService("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
		outSR = new esri.SpatialReference({wkid:102100});
		
		//Use the GeometryService to project the point into the output spatial reference.
		//The results are passed to the post_project function.
		gsvc.project([ pt ], outSR, post_project);
	}

	/**
		post_project(features)
		features: The features resulting from the GeometryService.project operation. In this case, an array with 1 point.
		
		Draw the projected coordinate to the map.
	*/
	function post_project(features){
	
		currentPosition = features[0];
		
		//clear previous position on map (if one exists)
		if(prj_graphic != null){
			map.graphics.remove(prj_graphic);
		}
		
		//Define the symbol that will be used to draw the position.
		//symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_X,15,new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255]), 2), new dojo.Color([255, 255, 0, 0.5]));
		symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([51, 0, 204]), 2), new dojo.Color([51, 153, 255]));
		
		//Check if the projected coordinate falls within the extent of the data.
		//If it does, draw it to the map.
		//if (borderLayer.fullExtent.contains(features[0])){
			//TODO: Why am I recreating the point?
			//var prj_pt = new esri.geometry.Point(features[0].x,features[0].y,new esri.SpatialReference({wkid:102100}));
			//Create a graphic to be drawn at the projected coordinate with the previously defined symbol
			//prj_graphic = new esri.Graphic(prj_pt, symbol);
			prj_graphic = new esri.Graphic(currentPosition, symbol);
			//Add the graphic to the default graphics layer
			//TODO: Should probably have a dedicated graphics layer for this
			map.graphics.add(prj_graphic);
			//Center the map at the new location.
			//TODO: Would be nice if the user could turn this on or off.
			//map.centerAt(prj_pt);
		//}
		//else{
		//	dojo.byId('toggleLocator').src = "../img/loc_err.png";
		//}
	}