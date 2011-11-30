function showLotsByType(parkingType){
	var queryTask = new esri.tasks.QueryTask(parkingPointURL);
	var query = new esri.tasks.Query();
	query.outFields = ["*"];
	query.returnGeometry = true;
	query.where = "PARKINGTYPE2 LIKE '%" + parkingType + "%'";
	queryTask.execute(query,
		function(parkFtrs){
			parkingPointSelectionLayer.clear();
			dojo.forEach(parkFtrs.features,function(ftr){
				parkingPointSelectionLayer.add(ftr);
				dijit.byId('identInfo').domNode.textContent = parkingType + " Parking";
				enableInfo();
			});	
		},
		function(evt){
			console.log(evt);
		});
}