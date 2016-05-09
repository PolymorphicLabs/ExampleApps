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
		
		
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = true;
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchstart', app.connect, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
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
    onDeviceConnect: function(swInterface){
    	//Save interface
    	app.connectedDevices.push(swInterface);
    	
    	//Create charts to display data from this device
    	var smoothieAccel = new SmoothieChart({grid:{fillStyle:'#ffffff',strokeStyle:'#666666'},labels:{fillStyle:'#ee7217'}});
    	var smoothieGyro = new SmoothieChart({grid:{fillStyle:'#ffffff',strokeStyle:'#666666'},labels:{fillStyle:'#ee7217'}});
    	var smoothieMag = new SmoothieChart({grid:{fillStyle:'#ffffff',strokeStyle:'#666666'},labels:{fillStyle:'#ee7217'}});

    	var accelX = new TimeSeries();
    	var accelY = new TimeSeries();
    	var accelZ = new TimeSeries();

    	var gyroX = new TimeSeries();
    	var gyroY = new TimeSeries();
    	var gyroZ = new TimeSeries();

    	var magX = new TimeSeries();
    	var magY = new TimeSeries();
    	var magZ = new TimeSeries();
    	
	    smoothieAccel.addTimeSeries(accelX, {lineWidth:2,strokeStyle:'#0000ff'});
	    smoothieAccel.addTimeSeries(accelY, {lineWidth:2,strokeStyle:'#00ff00'});
	    smoothieAccel.addTimeSeries(accelZ, {lineWidth:2,strokeStyle:'#ff0000'});
	    smoothieAccel.streamTo(document.getElementById("accelCanvas" + swInterface.deviceId));
      
		smoothieGyro.addTimeSeries(gyroX, {lineWidth:2,strokeStyle:'#0000ff'});
		smoothieGyro.addTimeSeries(gyroY, {lineWidth:2,strokeStyle:'#00ff00'});
		smoothieGyro.addTimeSeries(gyroZ, {lineWidth:2,strokeStyle:'#ff0000'});
		smoothieGyro.streamTo(document.getElementById("gyroCanvas" + swInterface.deviceId));
    

		smoothieMag.addTimeSeries(magX, {lineWidth:2,strokeStyle:'#0000ff'});
		smoothieMag.addTimeSeries(magY, {lineWidth:2,strokeStyle:'#00ff00'});
		smoothieMag.addTimeSeries(magZ, {lineWidth:2,strokeStyle:'#ff0000'});
		smoothieMag.streamTo(document.getElementById("magCanvas" + swInterface.deviceId));
		
		var onMoveData = function(data){

	        var a = new Int16Array(data);
	        
	        accelX.append(new Date().getTime(), app.sensorMpu9250AccConvert(a[3]));
	        accelY.append(new Date().getTime(), app.sensorMpu9250AccConvert(a[4]));
	        accelZ.append(new Date().getTime(), app.sensorMpu9250AccConvert(a[5]));
	        
	        gyroX.append(new Date().getTime(), app.sensorMpu9250GyroConvert(a[0]));
	        gyroY.append(new Date().getTime(), app.sensorMpu9250GyroConvert(a[1]));
	        gyroZ.append(new Date().getTime(), app.sensorMpu9250GyroConvert(a[2]));
	        
	        magX.append(new Date().getTime(), a[6]);
	        magY.append(new Date().getTime(), a[7]);
	        magZ.append(new Date().getTime(), a[8]);
		};
		
		swInterface.registerMoveCallback(onMoveData);
		swInterface.enableMoveCallback();
		swInterface.setMovePeriod(0x0A);
		swInterface.enableAllMove();
    	
    },
    connect: function() {
    	pmlManager.stopScan();
    	pmlManager.connect(app.selectedDevices, app.onDeviceConnect);
    	
    	//Create some DOM for our graphs
    	for(var i = 0; i < app.selectedDevices.length; i++){
    		var dataPage = document.createElement('div');
    		//Set ID so we can find and later delete this div
    		dataPage.setAttribute("id", app.selectedDevices[i]);

    		var html =  '<b>' + app.selectedDevices[i] + '</b><br>' +
    					'<div id="accelerometerData">Accelerometer</div>' +
    					'<canvas id="accelCanvas'+ app.selectedDevices[i] +'" width="350" height="100"></canvas>' +
    					'<div id="gyroData">Gyroscope</div>' +
    					'<canvas id="gyroCanvas'+ app.selectedDevices[i] +'" width="350" height="100"></canvas>' +
    					'<div id="magData">Magnetometer</div>' +
    					'<canvas id="magCanvas'+ app.selectedDevices[i] +'" width="350" height="100"></canvas>';
    		dataPage.innerHTML = html;
    		dataBody.appendChild(dataPage);
    	}
    	
    	app.showDetailPage();
   
    },
    onButtonData: function(data) {
        console.log(data);
        var message;
        var a = new Uint8Array(data);
        switch(a[0]) { 
        case 0:
            message = "No buttons are pressed";
            break;
        case 1:
            message = "Left Button";
            break;
        case 2:
            message = "Power Button";
            break;
        default:
            message = "Error";
        }

        buttonState.innerHTML = message;
    },

    sensorMpu9250GyroConvert: function(data){
        return data / (65536/500);
    },

    sensorMpu9250AccConvert: function(data){
        // Change  /2 to match accel range...i.e. 16 g would be /16
        return data / (32768 / 2);
    },


    sensorBarometerPressureConvert: function(data){
        return (data / 1000);

    },
    sensorBarometerTemperatureConvert: function(data){
        return (data / 100);

    },
    onBarometerData: function(data) {
         console.log(data);
         var message;
         var a = new Float32Array(data);
            
         //0 Pressure
         //1 Temperature
         message =  "Temperature " +
                    app.sensorBarometerTemperatureConvert( a[1]).toFixed(2) + "Degrees C <br/>" +
                    "Pressure " +
                    app.sensorBarometerPressureConvert(a[0]).toFixed(3) + "kPa <br/>" ;

         
        barometerData.innerHTML = message;
         
    },
    disconnect: function(event) {
//        var deviceId = event.target.dataset.deviceId;
//        ble.disconnect(deviceId, app.showMainPage, app.onError);
    	//Disconnect from the selected devices
    	pmlManager.disconnect(app.selectedDevices);
    	//Remove graphs
    	for(var i = 0; i < app.selectedDevices.length; i++){
    		var elem = document.getElementById(app.selectedDevices[i]);
    		elem.parentElement.removeChild(elem);
    	}
    	//Show main page
    	app.showMainPage();
    },
    showMainPage: function() {
        mainPage.style.display = "block";
        detailPage.style.display = "none";
    },
    showDetailPage: function() {
        mainPage.style.display = "none";
        detailPage.style.display = "block";
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
