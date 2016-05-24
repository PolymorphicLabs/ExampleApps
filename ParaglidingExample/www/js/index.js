// ****************************************************************************
// Polymorphic Labs
// 
// Polymorphic Dot Example App
// Based on BLE-Central Example application. Original license follows.
// ****************************************************************************
//
// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, accelerometerData, buttonState, disconnectButton */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';



var app = {
	selectedDevices : [],
	connectedDevices : [],
	localPressure: 1013.25, //Set to standard pressure by default (hPa)
	currentPressure:0,
	map:{},
	locationWatch:{},
	intervalId:{},
	mapReady:0,
	latitude:0,
	longitude:0,

		
		
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = true;
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchstart', app.connect, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        mapButton.addEventListener('touchstart', this.showMapPage, false);
        detailButton.addEventListener('touchstart', this.showDetailPage, false);
        altButton.addEventListener('touchstart', this.zeroAlt, false);
    },
    zeroAlt: function(){
    	app.localPressure = app.currentPressure;
    },
    onDeviceReady: function() {
        pmlManager.startScan(app.onDiscoverDevice);
    },
    onSelectDevice: function(e){
    	if(e.checked){
    		app.selectedDevices.push(e.value);
    	}else{
    		var index = app.selectedDevices.indexOf(e.value);
    		if(index != -1)
    			app.selectedDevices.splice(index, 1);
    	}
    	
    },
    onDiscoverDevice: function(device) {

        var listItem = document.createElement('li'),
        html = '<b>' + device.name + '</b><div style="float:right;"><input type="checkbox" onclick="app.onSelectDevice(this);" name="connect-group" value="' +
        device.id + '" /></div><br/>' +
            'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
            device.id + '<hr>';

        	
	    listItem.dataset.deviceId = device.id;  // TODO
	    listItem.innerHTML = html;
	    deviceList.appendChild(listItem);
	    
	    //TODO: The following code doesn't work so the event listener is added manually in the tag
	    //TODO: Figure out why, and fix it
	    //Add a listener for the click events
//	    var deviceSel = deviceList.getElementsByTagName('input');
//	    deviceSel[deviceSel.length - 1].ontouchstart = app.onSelectDevice(this);
    },    
    updatePosition: function(position){
    	var speed = document.getElementById('speedText');
    	var html = 'Ground Speed: ' + position.coords.speed;
    	speed.innerHTML = html;
    	var heading = document.getElementById('headingText');
    	var html = 'Heading: ' + position.coords.heading;
    	heading.innerHTML = html;
    	var altitude = document.getElementById('altitudeText');
    	var html = 'Altitude: ' + position.coords.altitude;
    	altitude.innerHTML = html;
    	
    	app.latitude = position.coords.latitude;
    	app.longitude = position.coords.longitude;
//    	position.coords.latitude
//    	position.coords.longitude
//    	position.coords.heading
//    	position.coords.altitude
//    	position.coords.speed
    },
    onDeviceConnect: function(swInterface){
    	//Save interface
    	app.connectedDevices.push(swInterface);
    	
    	var options = {
    		    size : (window.innerWidth / 2) - 10,             // Sets the size in pixels of the indicator (square)
    		    roll : 0,               // Roll angle in degrees for an attitude indicator
    		    pitch : 0,              // Pitch angle in degrees for an attitude indicator
    		    heading: 0,             // Heading angle in degrees for an heading indicator
    		    vario: 0,               // Variometer in 1000 feets/min for the variometer indicator
    		    airspeed: 0,            // Air speed in knots for an air speed indicator
    		    altitude: 0,            // Altitude in feets for an altimeter indicator
    		    pressure: app.localPressure,         // Pressure in hPa for an altimeter indicator
    		    showBox : true,         // Sets if the outer squared box is visible or not (true or false)
    		    img_directory : 'img/'  // The directory where the images are saved to
    		}
    	var attitudeIndicator = $.flightIndicator('#attitude', 'attitude', options);
    	var headingIndicator = $.flightIndicator('#heading', 'heading', options);
    	var altitudeIndicator = $.flightIndicator('#altimeter', 'altimeter', options);
//    	var smoothieAlt = new SmoothieChart({millisPerPixel:1000, minValue:0, maxValue:5000, grid:{fillStyle:'#ffffff',strokeStyle:'#ffffff'},labels:{fillStyle:'#ee7217'}});
    	var smoothieAlt = new SmoothieChart({millisPerPixel:1000,grid:{fillStyle:'#ffffff',sharpLines:true,millisPerLine:60000,verticalSections:5},labels:{fillStyle:'#ee7217'},timestampFormatter:SmoothieChart.timeFormatter,maxValue:5000,minValue:0});
    	
    	
    	document.getElementById("altCanvas").width = (window.innerWidth / 2) - 10;
    	document.getElementById("altCanvas").height = (window.innerWidth / 2) - 10;
    	var altSeries = new TimeSeries();
    	smoothieAlt.addTimeSeries(altSeries, {lineWidth:2,strokeStyle:'#ee7217'});
    	smoothieAlt.streamTo(document.getElementById("altCanvas"));
		
		var onMoveData = function(data){
//	        var a = new Int16Array(data);
		};
		


		function simple_moving_averager(period) {
		    var nums = [];
		    return function(num) {
		        nums.push(num);
		        if (nums.length > period)
		            nums.splice(0,1);  // remove the first element of the array
		        var sum = 0;
		        for (var i in nums)
		            sum += nums[i];
		        var n = period;
		        if (nums.length < period)
		            n = nums.length;
		        return(sum/n);
		    }
		}

		var filtHeading = simple_moving_averager(3);
		var filtPitch = simple_moving_averager(3);
		var filtRoll = simple_moving_averager(3);
		



		
		var onAhrsData = function(data){
			
	    	var quaternion = new Float32Array(data);
	    	var q0 = quaternion[0];
	    	var q1 = quaternion[1];
	    	var q2 = quaternion[2];
	    	var q3 = quaternion[3];
	    		  
			var gx = 2 * (q1*q3 - q0*q2);
			var gy = 2 * (q0*q1 + q2*q3);
			var gz = q0*q0 - q1*q1 - q2*q2 + q3*q3;
			  
			var yaw = Math.atan2(2 * q1 * q2 - 2 * q0 * q3, 2 * q0*q0 + 2 * q1 * q1 - 1) * 180/Math.PI;
			var pitch = Math.atan(gx / Math.sqrt(gy*gy + gz*gz))  * 180/Math.PI;
			var roll = Math.atan(gy / Math.sqrt(gx*gx + gz*gz))  * 180/Math.PI;
			
//			smoothHeading(yaw);
//			smoothRoll(roll);
//			smoothPitch(pitch);

	        headingIndicator.setHeading(filtHeading(yaw));
	        attitudeIndicator.setRoll(filtRoll(roll));
	        attitudeIndicator.setPitch(filtPitch(pitch));
	        
//	        headingIndicator.setHeading(yaw);
//	        attitudeIndicator.setRoll(roll);
//	        attitudeIndicator.setPitch(pitch);
		};
		
		var onBaroData = function(data){
	         var a = new Float32Array(data);
	         var altitude = (app.localPressure - app.sensorBarometerPressureConvert(a[0])) * 0.0366;
	         app.currentPressure = app.sensorBarometerPressureConvert(a[0]);

	         altSeries.append(new Date().getTime(), altitude);
	         altitudeIndicator.setAltitude(altitude);
		};
		
		swInterface.registerMoveCallback(onMoveData);
		swInterface.enableMoveCallback();
		swInterface.setMovePeriod(0x0A);
		swInterface.enableAllMove();
		
		swInterface.registerAhrsCallback(onAhrsData);
		swInterface.enableAhrsCallback();
		swInterface.enableAhrs();
		
		swInterface.registerBaroCallback(onBaroData);
		swInterface.enableBaroCallback();
		swInterface.enableBaro();
		

		var icarus_center = new plugin.google.maps.LatLng(35.254642, -95.123247);
		var icarus_start = new plugin.google.maps.LatLng(35.327283, -94.472282);
		var loves = new plugin.google.maps.LatLng(35.486426, -95.149615);
		var mcalester = new plugin.google.maps.LatLng(34.932760, -95.731597);
		
		var onMapInit = function(){
			app.mapReady = 1;
			app.map.setMapTypeId(plugin.google.maps.MapTypeId.HYBRID);
			app.map.setCenter(icarus_center);
			app.map.setZoom(8);
			
			app.map.addMarker({
				  'position': loves,
				  'title': 'Loves',
				  'icon': {
				    'url': 'www/img/gas.png'
				   }
				});
			
		      app.map.addPolyline({
		          points: [
		            icarus_start,
		            loves,
		            mcalester,
		            icarus_start
		          ],
		          'color' : '#E75C14',
		          'width': 3,
		          'geodesic': true
		        });
			
		};
		

		// Define a div tag with id="map_canvas"
		var mapDiv = document.getElementById("mapBody");

		// Initialize the map plugin
		app.map = plugin.google.maps.Map.getMap(mapDiv);

		// You have to wait the MAP_READY event.
		app.map.on(plugin.google.maps.event.MAP_READY, onMapInit);

		
        app.locationWatch = navigator.geolocation.watchPosition(app.updatePosition,
                function(error){console.log(error);},
                {enableHighAccuracy: true});
        
        app.intervalId = window.setInterval(addPositionMarker, 60000);

        function addPositionMarker() {
          app.map.addMarker({
			  'position': new plugin.google.maps.LatLng(app.latitude, app.longitude),
			  'icon': 'blue'
			});
        }
		
    	
    },
    connect: function() {
    	pmlManager.stopScan();
    	pmlManager.connect(app.selectedDevices, app.onDeviceConnect);

    	app.showDetailPage();
   
    },

    sensorMpu9250GyroConvert: function(data){
        return data / (65536/500);
    },

    sensorMpu9250AccConvert: function(data){
        // Change  /2 to match accel range...i.e. 16 g would be /16
        return data / (32768 / 2);
    },


    sensorBarometerPressureConvert: function(data){
        return (data / 100);

    },
    sensorBarometerTemperatureConvert: function(data){
        return (data / 100);

    },
    disconnect: function(event) {
    	
    	//Disconnect from the selected devices
    	pmlManager.disconnect(app.selectedDevices);
    	
    	//Stop GPS
    	navigator.geolocation.clearWatch(app.locationWatch);
    	
    	//Show main page
    	app.showMainPage();
    },
    showMainPage: function() {
        mainPage.style.display = "block";
        detailPage.style.display = "none";
        mapPage.style.display = "none";
    },
    showDetailPage: function() {
        mainPage.style.display = "none";
        detailPage.style.display = "block";
        mapPage.style.display = "none";
    },
    showMapPage: function() {
        mainPage.style.display = "none";
        detailPage.style.display = "none";
        mapPage.style.display = "block";
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
