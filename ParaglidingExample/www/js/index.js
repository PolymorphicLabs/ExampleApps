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
	//barometer
	currentPressure:0,
	pressureAltitude:0,
	barometerTemp:0,
	
	//hygrometer
	relativeHumidity:0,
	hygrometerTemp:0,
	
	map:{},
	locationWatch:{},
	intervalId:{},
	mapReady:0,
	latitude:0,
	longitude:0,
	
	leftDevice:{},
	centerDevice:{},
	rightDevice:{},
	
	referencePitch:0,
	leftBrakeAngle:0,
	rightBrakeAngle:0,
	
	referenceHeading:0,
	leftHeading:0,
	rightHeading:0,
	collapse:false,

	indicatorOptions : {
		    size : (window.innerWidth / 2) - 10,             // Sets the size in pixels of the indicator (square)
		    roll : 0,               // Roll angle in degrees for an attitude indicator
		    pitch : 0,              // Pitch angle in degrees for an attitude indicator
		    heading: 0,             // Heading angle in degrees for an heading indicator
		    vario: 0,               // Variometer in 1000 feets/min for the variometer indicator
		    airspeed: 0,            // Air speed in knots for an air speed indicator
		    altitude: 0,            // Altitude in feets for an altimeter indicator
		    pressure: 0,         // Pressure in hPa for an altimeter indicator
		    showBox : true,         // Sets if the outer squared box is visible or not (true or false)
		    img_directory : 'img/'  // The directory where the images are saved to
		},
	attitudeIndicator :{},
		
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = true;
        app.attitudeIndicator = $.flightIndicator('#attitude', 'attitude', app.indicatorOptions);
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchstart', app.connect, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
    },
    onDeviceReady: function() {
        app.showMainPage();
    },
    onSelectDevice: function(e){
    	var newDevice = {id:e.value, position:e.name};
    	if(e.checked){
    		app.selectedDevices.push(newDevice);
    	}else{
    		var index = app.selectedDevices.indexOf(newDevice);
    		if(index != -1)
    			app.selectedDevices.splice(index, 1);
    	}
    	
    },
    onDiscoverDevice: function(device) {
    	
    	if(device.name === "Polymorphic AHRS"){
    		
            var leftListItem = document.createElement('li');
            var centerListItem = document.createElement('li');
            var rightListItem = document.createElement('li');

            var leftHtml = '<b>' + device.name +'<font color="'+device.color+'"> •</font>'+ '</b><div style="float:right;"><input type="checkbox" onclick="app.onSelectDevice(this);" name="left" value="' + device.id + '" /></div>';

            var centerHtml = '<b>' + device.name +'<font color="'+device.color+'"> •</font>'+ '</b><div style="float:right;"><input type="checkbox" onclick="app.onSelectDevice(this);" name="center" value="' + device.id + '" /></div>';

            var rightHtml = '<b>' + device.name +'<font color="'+device.color+'"> •</font>'+ '</b><div style="float:right;"><input type="checkbox" onclick="app.onSelectDevice(this);" name="right" value="' + device.id + '" /></div>';

            
//            deviceList.push({id:device.id, position});


    	    leftListItem.dataset.deviceId = device.id;  // TODO
    	    centerListItem.dataset.deviceId = device.id;  // TODO
    	    rightListItem.dataset.deviceId = device.id;  // TODO

    	    leftListItem.innerHTML = leftHtml;
    	    centerListItem.innerHTML = centerHtml;
    	    rightListItem.innerHTML = rightHtml;
    	    
    	    
    	    leftList.appendChild(leftListItem);
    	    centerList.appendChild(centerListItem);
    	    rightList.appendChild(rightListItem);
    		
    	}else if(device.name === "Polymorphic Dot"){
    		
    	}


	    
	    //TODO: The following code doesn't work so the event listener is added manually in the tag
	    //TODO: Figure out why, and fix it
	    //Add a listener for the click events
//	    var deviceSel = deviceList.getElementsByTagName('input');
//	    deviceSel[deviceSel.length - 1].ontouchstart = app.onSelectDevice(this);
    },    
    updatePosition: function(position){
    	var speed = document.getElementById('speedText');
    	var html = 'Ground Speed: <br>' + position.coords.speed;
    	speed.innerHTML = html;

    	var altitude = document.getElementById('gpsAltText');
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
    onDeviceConnect: function(device){
    	
    	//Helper functions
    	function standardDeviation(values){
    		  var avg = average(values);
    		  
    		  var squareDiffs = values.map(function(value){
    		    var diff = value - avg;
    		    var sqrDiff = diff * diff;
    		    return sqrDiff;
    		  });
    		  
    		  var avgSquareDiff = average(squareDiffs);
    		 
    		  var stdDev = Math.sqrt(avgSquareDiff);
    		  return stdDev;
    	}
    		 
    	function average(data){
    		  var sum = data.reduce(function(sum, value){
    		    return sum + value;
    		  }, 0);
    		 
    		  var avg = sum / data.length;
    		  return avg;
    	}
    	
    	
    	//Save interface
    	app.connectedDevices.push(device.id);
    	
    	if(device.name === "Polymorphic Dot"){
		

		
    	}else if(device.name === "Polymorphic AHRS"){
    		
    		for(var i = 0; i< app.selectedDevices.length; i++){
    			if(app.selectedDevices[i].id === device.id){
    				break;
    			}
    		}
    		
    		if(app.selectedDevices[i].position === "left"){
    			//Found a left device.  Use this to measure left brake input
    			var onOrientationData = function(data){
    		        var quaternion = new Int16Array(data);
    		        
    		    	var q0 = quaternion[0]/0x4000;
    		    	var q1 = quaternion[1]/0x4000;
    		    	var q2 = quaternion[2]/0x4000;
    		    	var q3 = quaternion[3]/0x4000;
    		    		  
    				var gx = 2 * (q1*q3 - q0*q2);
    				var gy = 2 * (q0*q1 + q2*q3);
    				var gz = q0*q0 - q1*q1 - q2*q2 + q3*q3;
    				  
    				var yaw = Math.atan2(2 * q1 * q2 - 2 * q0 * q3, 2 * q0*q0 + 2 * q1 * q1 - 1) * 180/Math.PI;
    				var pitch = Math.atan(gx / Math.sqrt(gy*gy + gz*gz))  * 180/Math.PI;
    				var roll = Math.atan(gy / Math.sqrt(gx*gx + gz*gz))  * 180/Math.PI;
    				
    		        //Swizzle the heading a bit
    		        yaw *= -1;
    		        if(yaw < 0){
    		        	yaw +=360
    		        }
    		        yaw +=90;
    		        if(yaw > 360){
    		        	yaw-= 360;
    		        }
    				
    		        
    		        app.leftBrakeAngle = (app.referencePitch - pitch) / 90;
    		        app.leftHeading = yaw;
    		        
    		        
    		        var canvas = document.getElementById('leftBrakeCanvas');
    		        if (canvas.getContext) {
    		          var ctx = canvas.getContext('2d');
    		          //clear the canvas first
    		          ctx.clearRect(0,0,canvas.width,canvas.height);
    		          if(app.leftBrakeAngle > 0){
    		        	  //Draw green bar
    		        	  ctx.fillStyle="#00FF00";
    		        	  var brakeTop = ((0.45-app.leftBrakeAngle)/.45) * (1/3) * canvas.height;
    		        	  ctx.fillRect(0, brakeTop, canvas.width, (1/3) * canvas.height - brakeTop);
    		        	  //Draw text
    		        	  ctx.fillStyle="#000000";
    		        	  ctx.font = "12px serif";
    		        	  ctx.fillText((app.leftBrakeAngle*100).toFixed(0) + "°", 0, canvas.height);
    		          }else{
    		        	  //draw red bar
    		        	  ctx.fillStyle="#FF0000";
    		        	  var brakeBottom = (app.leftBrakeAngle / -.9) * (2/3) * canvas.height;
    		        	  ctx.fillRect(0, (1/3) * canvas.height, canvas.width, brakeBottom);
    		        	  //Draw text
    		        	  ctx.fillStyle="#000000";
    		        	  ctx.font = "12px serif";
    		        	  ctx.fillText((app.leftBrakeAngle*100).toFixed(0) + "°", 0, canvas.height);
    		          }
    		        }

    			};
    			
    			pmlAHRS.registerOrientationCallback(device.id, onOrientationData);
    			pmlAHRS.setMovePeriod(device.id, 0x0A);
    			pmlAHRS.setOperatingMode(device.id, 0x0C);
    			//wait for the write to go through
    			setTimeout(function(){pmlAHRS.enableOrientationCallback(device.id)}, 1000);
    			
    		}else if(app.selectedDevices[i].position === "center"){
    			//Found a center device.  Use this as the reference
    			
    			var onBaroData = function(data){
		         var a = new Float32Array(data);
		         app.pressureAltitude = (1- Math.pow(app.sensorBarometerPressureConvert(a[0])/1013.25, 0.190248)) * 145366.45;
		         app.currentPressure = app.sensorBarometerPressureConvert(a[0]);
		         app.barometerTemp = app.sensorBarometerTemperatureConvert(a[1]);
		         
		     	var altitudeText = document.getElementById('pressureAltText');
		    	var html = 'Pressure Altitude: <br>' + app.pressureAltitude.toFixed(0);
		    	altitudeText.innerHTML = html;
		    	
		     	var tempText = document.getElementById('temperatureText');
		    	var html = 'Temperature: <br>' + app.barometerTemp.toFixed(0) + "°C\\" + (app.barometerTemp * 1.8 + 32).toFixed(0) + "°F" ;
		    	tempText.innerHTML = html;
	
//		         altSeries.append(new Date().getTime(), altitude);
//		         altitudeIndicator.setAltitude(altitude);
			};
			
			var onHumidityData = function(data){
				var a = new Uint16Array(data);
				app.relativeHumidity = (a[1] / 65536)*100;
			    app.hygrometerTemp = (a[0] / 65536)*165 - 40;
			    
		     	var humidityText = document.getElementById('humidityText');
		    	var html = 'RH: <br>' + app.relativeHumidity.toFixed(0) + "%";
		    	humidityText.innerHTML = html;
			};
    			
    			var onOrientationData = function(data){
    		        var quaternion = new Int16Array(data);
    		        
    		    	var q0 = quaternion[0]/0x4000;
    		    	var q1 = quaternion[1]/0x4000;
    		    	var q2 = quaternion[2]/0x4000;
    		    	var q3 = quaternion[3]/0x4000;
    		    		  
    				var gx = 2 * (q1*q3 - q0*q2);
    				var gy = 2 * (q0*q1 + q2*q3);
    				var gz = q0*q0 - q1*q1 - q2*q2 + q3*q3;
    				  
    				var yaw = Math.atan2(2 * q1 * q2 - 2 * q0 * q3, 2 * q0*q0 + 2 * q1 * q1 - 1) * 180/Math.PI;
    				var pitch = Math.atan(gx / Math.sqrt(gy*gy + gz*gz))  * 180/Math.PI;
    				var roll = Math.atan(gy / Math.sqrt(gx*gx + gz*gz))  * 180/Math.PI;
    				
//    		        headingIndicator.setHeading(yaw);
    		        app.attitudeIndicator.setRoll(roll);
    		        app.attitudeIndicator.setPitch(pitch);
    		        
    		        app.referencePitch = pitch;
    		        
    		        //Swizzle the heading a bit
    		        yaw *= -1;
    		        if(yaw < 0){
    		        	yaw +=360
    		        }
    		        yaw +=90;
    		        if(yaw > 360){
    		        	yaw-= 360;
    		        }
    		        
    		        app.referenceHeading = yaw;
    		        var stdDev = standardDeviation([app.referenceHeading, app.leftHeading, app.rightHeading]);
    		        if(stdDev > 5){
    		        	app.collapse = true;
    		        }else{
    		        	app.collapse = false;
    		        }
    		        
    		    	var heading = document.getElementById('headingText');
    		    	var html = 'Heading: <br>' + yaw.toFixed(0) +"°";
    		    	heading.innerHTML = html;
    		    	
    		    	var pitchText = document.getElementById('pitchText');
    		    	var html = 'Pitch: <br>' + pitch.toFixed(0) +"°";
    		    	pitchText.innerHTML = html;
    		    	

    		    	

    		    	var rollText = document.getElementById('rollText');
    		    	var html = 'Roll: <br>' + Math.abs(roll.toFixed(0)) +"°";
    		    	rollText.innerHTML = html;
    		        

    			};
    			
    			//Center
    			pmlAHRS.registerPressureCallback(device.id, onBaroData);
    			pmlAHRS.enablePressureCallback(device.id);
    			
    			pmlAHRS.registerHumidityCallback(device.id, onHumidityData);
    			pmlAHRS.enableHumidityCallback(device.id);
    			
    			pmlAHRS.registerOrientationCallback(device.id, onOrientationData);
    			pmlAHRS.setMovePeriod(device.id, 0x0A);
    			pmlAHRS.setOperatingMode(device.id, 0x0C);
    			//wait for the write to go through
    			setTimeout(function(){pmlAHRS.enableOrientationCallback(device.id)}, 1000);
    			
    		}else if(app.selectedDevices[i].position === "right"){
    			//Found a right device.  Use this to measure right brake input
    			var onOrientationData = function(data){
    		        var quaternion = new Int16Array(data);
    		        
    		    	var q0 = quaternion[0]/0x4000;
    		    	var q1 = quaternion[1]/0x4000;
    		    	var q2 = quaternion[2]/0x4000;
    		    	var q3 = quaternion[3]/0x4000;
    		    		  
    				var gx = 2 * (q1*q3 - q0*q2);
    				var gy = 2 * (q0*q1 + q2*q3);
    				var gz = q0*q0 - q1*q1 - q2*q2 + q3*q3;
    				  
    				var yaw = Math.atan2(2 * q1 * q2 - 2 * q0 * q3, 2 * q0*q0 + 2 * q1 * q1 - 1) * 180/Math.PI;
    				var pitch = Math.atan(gx / Math.sqrt(gy*gy + gz*gz))  * 180/Math.PI;
    				var roll = Math.atan(gy / Math.sqrt(gx*gx + gz*gz))  * 180/Math.PI;
    				
    		        //Swizzle the heading a bit
    		        yaw *= -1;
    		        if(yaw < 0){
    		        	yaw +=360
    		        }
    		        yaw +=90;
    		        if(yaw > 360){
    		        	yaw-= 360;
    		        }
    				
    		        app.rightHeading = yaw;
    		        app.rightBrakeAngle = (app.referencePitch - pitch) / 90;
    		        
    		        var canvas = document.getElementById('rightBrakeCanvas');
    		        if (canvas.getContext) {
    		          var ctx = canvas.getContext('2d');
    		          //clear the canvas first
    		          ctx.clearRect(0,0,canvas.width,canvas.height);
    		          if(app.rightBrakeAngle > 0){
    		        	  //Draw green bar
    		        	  ctx.fillStyle="#00FF00";
    		        	  var brakeTop = ((0.45-app.rightBrakeAngle)/.45) * (1/3) * canvas.height;
    		        	  ctx.fillRect(0, brakeTop, canvas.width, (1/3) * canvas.height - brakeTop);
    		        	  //Draw text
    		        	  ctx.fillStyle="#000000";
    		        	  ctx.font = "12px serif";
    		        	  ctx.fillText((app.leftBrakeAngle*100).toFixed(0) + "°", 0, canvas.height);
    		        
    		          }else{
    		        	  //draw red bar
    		        	  ctx.fillStyle="#FF0000";
    		        	  var brakeBottom = (app.rightBrakeAngle / -.9) * (2/3) * canvas.height;
    		        	  ctx.fillRect(0, (1/3) * canvas.height, canvas.width, brakeBottom);
    		        	  //Draw text
    		        	  ctx.fillStyle="#000000";
    		        	  ctx.font = "12px serif";
    		        	  ctx.fillText((app.rightBrakeAngle*100).toFixed(0) + "°", 0, canvas.height);
    		          }
    		        }

    			};
    			
    			pmlAHRS.registerOrientationCallback(device.id, onOrientationData);
    			pmlAHRS.setMovePeriod(device.id, 0x0A);
    			pmlAHRS.setOperatingMode(device.id, 0x0C);
    			//wait for the write to go through
    			setTimeout(function(){pmlAHRS.enableOrientationCallback(device.id)}, 1000);
    			
    			
    			
    		}else{
    			//Shouldn't get here
    			console.log("Found a device without a position");
    		}
    		
//			var onBaroData = function(data){
//		         var a = new Float32Array(data);
////		         var altitude = (app.localPressure - app.sensorBarometerPressureConvert(a[0])) * 0.0366;
//		         var altitude = (1-(app.sensorBarometerPressureConvert(a[0])/1013.25)^0.190248) * 145366.45;
//		         app.currentPressure = app.sensorBarometerPressureConvert(a[0]);
//		         
//		     	var altitudeText = document.getElementById('densityAltText');
//		    	var html = 'Density Altitude: ' + altitude;
//		    	altitudeText.innerHTML = html;
//	
////		         altSeries.append(new Date().getTime(), altitude);
////		         altitudeIndicator.setAltitude(altitude);
//			};
//    		
//			var onOrientationData = function(data){
//		        var quaternion = new Int16Array(data);
//		        
//		    	var q0 = quaternion[0]/0x4000;
//		    	var q1 = quaternion[1]/0x4000;
//		    	var q2 = quaternion[2]/0x4000;
//		    	var q3 = quaternion[3]/0x4000;
//		    		  
//				var gx = 2 * (q1*q3 - q0*q2);
//				var gy = 2 * (q0*q1 + q2*q3);
//				var gz = q0*q0 - q1*q1 - q2*q2 + q3*q3;
//				  
//				var yaw = Math.atan2(2 * q1 * q2 - 2 * q0 * q3, 2 * q0*q0 + 2 * q1 * q1 - 1) * 180/Math.PI;
//				var pitch = Math.atan(gx / Math.sqrt(gy*gy + gz*gz))  * 180/Math.PI;
//				var roll = Math.atan(gy / Math.sqrt(gx*gx + gz*gz))  * 180/Math.PI;
//				
////		        headingIndicator.setHeading(yaw);
//		        attitudeIndicator.setRoll(roll);
//		        attitudeIndicator.setPitch(pitch);
//		        
//		        //Swizzle the heading a bit
//		        yaw *= -1;
//		        if(yaw < 0){
//		        	yaw +=360
//		        }
//		        yaw +=90;
//		        if(yaw > 360){
//		        	yaw-= 360;
//		        }
//		        
//		    	var heading = document.getElementById('headingText');
//		    	var html = 'Heading: <br>' + yaw.toFixed(0) +"°";
//		    	heading.innerHTML = html;
//		    	
//		    	var pitchText = document.getElementById('pitchText');
//		    	var html = 'Pitch: <br>' + pitch.toFixed(0) +"°";
//		    	pitchText.innerHTML = html;
//		    	
//		    	var yawText = document.getElementById('yawText');
//		    	var html = 'Yaw: <br>' + yaw.toFixed(0) +"°";
//		    	yawText.innerHTML = html;
//		    	
//
//		    	var rollText = document.getElementById('rollText');
//		    	var html = 'Roll: <br>' + Math.abs(roll.toFixed(0)) +"°";
//		    	rollText.innerHTML = html;
//		        
//
//			};
//			
//			pmlAHRS.registerPressureCallback(device.id, onBaroData);
//			pmlAHRS.enablePressureCallback(device.id);
//			
//			pmlAHRS.registerOrientationCallback(device.id, onOrientationData);
//			pmlAHRS.setMovePeriod(device.id, 0x0A);
//			pmlAHRS.setOperatingMode(device.id, 0x0C);
//			//wait for the write to go through
//			setTimeout(function(){pmlAHRS.enableOrientationCallback(device.id)}, 1000);
    		
    	}
		

	
        app.locationWatch = navigator.geolocation.watchPosition(app.updatePosition,
                function(error){console.log(error);},
                {enableHighAccuracy: true});

		
    	
    },
    connect: function() {
    	pmlManager.stopScan();
    	var deviceIds = [];
    	for (var i = 0; i < app.selectedDevices.length; i++){
    		deviceIds.push(app.selectedDevices[i].id);
    	}
    	pmlManager.connect(deviceIds, app.onDeviceConnect);
    	
    	//Clear Device List
    	while (leftList.firstChild) {
    		leftList.removeChild(leftList.firstChild);
    	}
    	while (centerList.firstChild) {
    		centerList.removeChild(centerList.firstChild);
    	}
    	while (rightList.firstChild) {
    		rightList.removeChild(rightList.firstChild);
    	}
    	while (helmetList.firstChild) {
    		helmetList.removeChild(helmetList.firstChild);
    	}

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
    	
    	//Clear out the selected/connected devices array
    	app.selectedDevices = [];
    	app.connectedDevice = [];
    	
    	//Stop GPS
    	navigator.geolocation.clearWatch(app.locationWatch);
    	
    	//Show main page
    	app.showMainPage();
    },
    showMainPage: function() {
        mainPage.style.display = "block";
        detailPage.style.display = "none";
        
        pmlManager.startScan(app.onDiscoverDevice);
    },
    showDetailPage: function() {
        mainPage.style.display = "none";
        detailPage.style.display = "block";
        app.resizeCanvas();
    },
    resizeCanvas: function(){
    	function fitToContainer(canvas){
    		  canvas.style.width='100%';
    		  canvas.style.height='100%';
    		  canvas.width  = canvas.offsetWidth;
    		  canvas.height = canvas.offsetHeight;
    	};
    	var leftBrakeCanvas = document.getElementById("leftBrakeCanvas");
    	fitToContainer(leftBrakeCanvas);
    	var rightBrakeCanvas = document.getElementById("rightBrakeCanvas");
    	fitToContainer(rightBrakeCanvas);
    	
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
