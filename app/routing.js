/**
 * @author jmccarth
 */


function disableRouting(){
	dojo.byId("routeButton").src = "img/route_off.png";
}

function enableRouting(){
	dojo.byId("routeButton").src = "img/route.png";
}

function solveRoute(accessibleRoute){
	if (accessibleRoute) {
		routeParams.restrictionAttributes = ["Accessibility"];
	}
	else{
		routeParams.restrictionAttributes = [];
	}
	var startPoint = currentPosition;
	var endPoint = destination;
	addStop(startPoint);
	addStop(endPoint);
}

function addStop(pnt) {

	var stop = new esri.Graphic(pnt, stopSymbol);				
	routeParams.stops.features.push(stop);

    if (routeParams.stops.features.length >= 2) {
	  routeTask.solve(routeParams);
      lastStop = routeParams.stops.features.splice(0, 1)[0];
    }
}

 //Adds the solved route to the map as a graphic
function showRoute(solveResult) {
    routeLayer.clear();

	solveResult.routeResults[0].route.geometry.spatialReference = new esri.SpatialReference({wkid:102100});
	routeLayer.add(solveResult.routeResults[0].route);
	map.setExtent(solveResult.routeResults[0].route.geometry.getExtent());
	map.centerAndZoom(map.extent.getCenter(),map.getLevel() - 1);
	routeParams.stops = new esri.tasks.FeatureSet();
}

  //Displays any error returned by the Route Task
 function routeErrorHandler(err) {
    alert("An error occured\n" + err.message + "\n" + err.details.join("\n"));

    routeParams.stops.features.splice(0, 0, lastStop);
    map.graphics.remove(routeParams.stops.features.splice(1, 1)[0]);
 }