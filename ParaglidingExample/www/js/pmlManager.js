var pmlManager;


(function(){
    //I recommend this
    'use strict';
    function defineLibrary(){
        var pmlManager = {};
        
        //Set PML Manager Version Here
        pmlManager.version = "1";
        
        //Polymorphic Hardware Definitions
        var hwDefs = {
        	version : "1",
	        pmDotMove : [
	        	{
	        			version: "1",
		        		//Polymorphic Dot Service definitions
		        		//http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User%27s_Guide
		        		movement : {
		        		    service: "F000AA80-0451-4000-B000-000000000000",
		        		    data: "F000AA81-0451-4000-B000-000000000000", //GyroX[0:7], GyroX[8:15], GyroY[0:7], GyroY[8:15], GyroZ[0:7], GyroZ[8:15], AccX[0:7], AccX[8:15], AccY[0:7], AccY[8:15], AccZ[0:7], AccZ[8:15], MagX[0:7], MagX[8:15], MagY[0:7], MagY[8:15], MagZ[0:7], MagZ[8:15]
		        		    notification:"F0002902-0451-4000-B000-000000000000",//Write 0x0001 to enable notifications, 0x0000 to disable.
		        		    configuration: "F000AA82-0451-4000-B000-000000000000", //One bit for each gyro and accelerometer axis (6), magnetometer (1), wake-on-motion enable (1), accelerometer range (2). Write any bit combination top enable the desired features. Writing 0x0000 powers the unit off.
		        		    period: "F000AA83-0451-4000-B000-000000000000" //Resolution 10 ms. Range 100 ms (0x0A) to 2.55 sec (0xFF). Default 1 second (0x64).
		        		},
		        		ahrs : {
		        				service: "F000AA20-0451-4000-B000-000000000000",
		        				data: "F000AA21-0451-4000-B000-000000000000",
		        				configuration: "F000AA22-0451-4000-B000-000000000000",
		        				period: "F000AA23-0451-4000-B000-000000000000"
		        					
		        		},
		
		        		barometer : {
		        		    service: "F000AA40-0451-4000-B000-000000000000",
		        		    data: "F000AA41-0451-4000-B000-000000000000", //(float) pressure [0:31], (float) temperature [32:63]
		        		    notification: "F0002902-0451-4000-B000-000000000000", //Write 0x0001 to enable notifications, 0x0000 to disable.
		        		    configuration: "F000AA42-0451-4000-B000-000000000000",//Write 0x01 to enable data collection, 0x00 to disable.
		        		    period: "F000AA43-0451-4000-B000-000000000000" //Resolution 10 ms. Range 100 ms (0x0A) to 2.55 sec (0xFF). Default 1 second (0x64).
		
		        		},
		
		        		irTherm : {
	        			    service: "F000AA00-0451-4000-B000-000000000000", //
	        			    data: "F000AA01-0451-4000-B000-000000000000", //Object[0:7], Object[8:15], Ambience[0:7], Ambience[8:15]
	        			    notification: "F0002902-0451-4000-B000-000000000000", //Write 0x0001 to enable notifications, 0x0000 to disable.
	        			    configuration: "F000AA02-0451-4000-B000-000000000000", //Write 0x01 to enable data collection, 0x00 to disable.
	        			    period: "F000AA03-0451-4000-B000-000000000000" //Resolution 10 ms. Range 300 ms (0x1E) to 2.55 sec (0xFF). Default 1 second (0x64)
		        				
		        		},
		        		
		        		io : {
		        				service: "F000AA64-0451-4000-B000-000000000000",
		        				data: "F000AA65-0451-4000-B000-000000000000",
		        				configuration: "F000AA66-0451-4000-B000-000000000000"
		        				
		        		},
		
		        		//http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Simple_Key_Service
		        		button : {
		        		    service: "FFE0",
		        		    data: "FFE1", // Bit 2: side key, Bit 1- right key, Bit 0 –left key
		        		},
		        		
		        		oad : {
		        			service : "F000FFC0-0451-4000-B000-000000000000",
		        			imageId: "F000FFC1-0451-4000-B000-000000000000",
		        			imageBlock: "F000FFC2-0451-4000-B000-000000000000"	
		        		},
		        		connection : {
		        			service : "F000CCC0-0451-4000-B000-000000000000",
		        			conParams : "F000CCC1-0451-4000-B000-000000000000",
		        			reqConParams: "F000CCC2-0451-4000-B000-000000000000",
		        			reqDisconnect: "F000CCC3-0451-4000-B000-000000000000"
		        		}
	        	}
	        ]
        };
        

        
        var foundDevices = [];
        var connectedDevices = [];
        var scanCallback;
        var connectCallback;
        
        //*********************************************************************
        //Private OAD PML Manager functions go here
        //*********************************************************************
        var oadConnect = function(){
        	console.log("OAD TEST");
        }
        
        //*********************************************************************
        //Private PML Manager functions go here
        //*********************************************************************
        var updateHwDefs = function(){
        	//Check for hwDefs in indexDB
        	//If found, grab version number and compare to latest on PML.com, download new copy as neccessary and store in indexDB
        	//If not found, try to grab latest version from PML.com
        	console.log("HWDEFS TEST");
        }
        var onError = function(reason){
        	console.log(reason);
        }
        var onDiscoverDevice = function(device){
        	foundDevices.push(device);
        	scanCallback(device);
        }
        var onConnect = function(device){
        	connectedDevices.push(device);
        	//Callback to application with user friendly object
        	
        	connectCallback(new pmlDotMove(device.id, hwDefs.pmDotMove[0]));
        	console.log(device);
        }
        
        //*********************************************************************
        //Public PML Manager functions go here
        //*********************************************************************
        pmlManager.update = function(){
        	updateHwDefs();
        }
        pmlManager.startScan = function(callback){
        	scanCallback = callback;
        	ble.startScan([], onDiscoverDevice, onError);
        }
        pmlManager.stopScan = function(){
        	ble.stopScan(function(){console.log("Scan Complete");}, onError);
        }
        pmlManager.getFoundDevices = function(){
        	return foundDevices;
        }
        pmlManager.getConnectedDevices = function(){
        	return connectedDevices;
        }
        pmlManager.connect = function(devices, callback){   
        	//Register callback
        	connectCallback = callback;
        	//Scan through array and connect to devices
        	for(var i = 0; i < devices.length; i++){
        		ble.connect(devices[i], onConnect, onError);
        	}
        }
        pmlManager.disconnect = function(devices){
        	//Scan through array and disconnect from devices
        	for(var i = 0; i < devices.length; i++){
        		ble.disconnect(devices[i], function(){console.log("Disconnected");}, onError);
        	}
        }
        
        
        pmlManager.getVersion = function(){
            return pmlManager.version;
        }
        return pmlManager;
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    //define globally if it doesn't already exist
    if(typeof(pmlManager) === 'undefined'){
        pmlManager = defineLibrary();
    }
    else{
        console.log("Library already defined.");
    }
})();