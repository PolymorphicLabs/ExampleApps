        

var pmlDotMove = function(device, hwDefs){
	 this.deviceId = device;
//	 this.hwDefs = hwDefs;
	 
	 var deviceId = device;
	 var hwDefs = hwDefs;
	 
	 //************************************************************************
	 //Movement Service Functions
	 //************************************************************************
	 var moveCallback;
	 var readMoveConfig = function(callback){
		 ble.read(deviceId, hwDefs.movement.service, hwDefs.movement.configuration,callback,function(error){console.log(error);});
	 }
	 this.registerMoveCallback = function(callback){
		 moveCallback = callback;
	 };
	 this.enableMoveCallback = function(){
		 ble.startNotification(deviceId, hwDefs.movement.service, hwDefs.movement.data, moveCallback, function(error){console.log(error);});
	 };
	 this.disableMoveCallback = function(){
		 ble.stopNotification(deviceId, hwDefs.movement.service, hwDefs.movement.data, function(){console.log("Movement Notifications Stopped");}, function(error){console.log(error);});
	 };
	 this.setMovePeriod = function(period){
		 //TODO: Add math to calculate period value
		 var periodData = new Uint8Array(1);
		 periodData[0] = period;
		 ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.period, periodData.buffer,
		     function() { console.log("Configured movement period."); },function(error){console.log(error);});
		 
	 };
	 this.enableAccel = function(){
		 onRead = function(data){
			 var configData = new Uint16Array(data);
			 configData[0] |= 0x38;	//Enable all accelerometers
	         ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.configuration, configData.buffer, 
	                 function() { console.log("Enabled accelerometers."); },function(error){console.log(error);});
		 };
		 readMoveConfig(onRead);
	 };
	 this.disableAccel = function(){
		 onRead = function(data){
			 var configData = new Uint16Array(data);
			 configData[0] &= ~0x38;	//Disable all accelerometers
	         ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.configuration, configData.buffer, 
	                 function() { console.log("Disabled accelerometers."); },function(error){console.log(error);});
		 };
		 readMoveConfig(onRead);
	 };
	 //range
	 //0 = 2G
	 //1 = 4G
	 //2 = 8G
	 //3 = 16G
	 this.setAccelRange = function(range){
		 onRead = function(data){
			 var configData = new Uint16Array(data);
			 configData[0] &= ~0x300;	//clear range config
			 configData[0] |= (range << 8);
	         ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.configuration, configData.buffer, 
	                 function() { console.log("Set accelerometer range."); },function(error){console.log(error);});
		 };
		 readMoveConfig(onRead);
	 };
	 this.enableGyro = function(){
		 onRead = function(data){
			 var configData = new Uint16Array(data);
			 configData[0] |= 0x07;	//Enable all gyroscopes
	         ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.configuration, configData.buffer, 
	                 function() { console.log("Enabled gyroscopes."); },function(error){console.log(error);});
		 };
		 readMoveConfig(onRead);
	 };
	 this.disableGyro = function(){
		 onRead = function(data){
			 var configData = new Uint16Array(data);
			 configData[0] &= ~0x07;	//Disable all gyroscopes
	         ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.configuration, configData.buffer, 
	                 function() { console.log("Disabled gyroscopes."); },function(error){console.log(error);});
		 };
		 readMoveConfig(onRead);
	 };
//	 var setGyroRange = function(range){
//		 //TODO: Change config data
//         var configData = new Uint16Array(1);
//         configData[0] = 0x007F; 
//         ble.write(this.deviceId, this.hwDefs.movement.service, this.hwDefs.movement.configuration, configData.buffer, 
//             function() { console.log("Configured movement."); },function(error){console.log(error);});
//	 };
	 this.enableMag = function(){
		 onRead = function(data){
			 var configData = new Uint16Array(data);
			 configData[0] |= 0x40;	//Enable all magnetometers
	         ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.configuration, configData.buffer, 
	                 function() { console.log("Enabled magnetometers."); },function(error){console.log(error);});
		 };
		 readMoveConfig(onRead);
	 };
	 this.disableMag = function(){
		 onRead = function(data){
			 var configData = new Uint16Array(data);
			 configData[0] &= ~0x40;	//Disable all magnetometers
	         ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.configuration, configData.buffer, 
	                 function() { console.log("Disabled magnetometers."); },function(error){console.log(error);});
		 };
		 readMoveConfig(onRead);
	 };
	 this.enableAllMove = function(){
		 onRead = function(data){
			 var configData = new Uint16Array(data);
			 configData[0] |= 0x7F;	//Enable all movement sensors
	         ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.configuration, configData.buffer, 
	                 function() { console.log("Enabled movement sensors."); },function(error){console.log(error);});
		 };
		 readMoveConfig(onRead);
	 };
	 this.disableAllMove = function(){
		 onRead = function(data){
			 var configData = new Uint16Array(data);
			 configData[0] &= ~0x7F;	//Disabled all movement sensors
	         ble.write(deviceId, hwDefs.movement.service, hwDefs.movement.configuration, configData.buffer, 
	                 function() { console.log("Disabled movement sensors."); },function(error){console.log(error);});
		 };
		 readMoveConfig(onRead);
	 };
	 
	//************************************************************************
	 //AHRS Service Functions
	 //************************************************************************
	 var ahrsCallback;
	 var readAhrsConfig = function(callback){
		 ble.read(deviceId, hwDefs.ahrs.service, hwDefs.ahrs.configuration,callback,function(error){console.log(error);});
	 }
	 this.registerAhrsCallback = function(callback){
		 ahrsCallback = callback;
	 };
	 this.enableAhrsCallback = function(){
		 ble.startNotification(deviceId, hwDefs.ahrs.service, hwDefs.ahrs.data, ahrsCallback, function(error){console.log(error);});
	 };
	 this.disableAhrsCallback = function(){
		 ble.stopNotification(deviceId, hwDefs.ahrs.service, hwDefs.ahrs.data, function(){console.log("AHRS Notifications Stopped");}, function(error){console.log(error);});
	 };
	 this.setAhrsPeriod = function(period){
		 //TODO: Add math to calculate period value
		 var periodData = new Uint8Array(1);
		 periodData[0] = period;
		 ble.write(deviceId, hwDefs.ahrs.service, hwDefs.ahrs.period, periodData.buffer,
		     function() { console.log("Configured AHRS period."); },function(error){console.log(error);});
		 
	 };
	 this.enableAhrs = function(){
		 var configData = new Uint8Array(1);
		 configData[0] = 1;	//Enable AHRS
         ble.write(deviceId, hwDefs.ahrs.service, hwDefs.ahrs.configuration, configData.buffer, 
                 function() { console.log("Enabled AHRS."); },function(error){console.log(error);});

	 };
	 this.disableAhrs = function(){
		 var configData = new Uint8Array(1);
		 configData[0] = 0;	//Disable AHRS
         ble.write(deviceId, hwDefs.ahrs.service, hwDefs.ahrs.configuration, configData.buffer, 
                 function() { console.log("Disabled AHRS."); },function(error){console.log(error);});
	 };
	 
	 
	 //************************************************************************
	 //Barometer Service Functions
	 //************************************************************************
	 var baroCallback;
	 this.registerBaroCallback = function(callback){
		 baroCallback = callback;
	 };
	 this.enableBaroCallback = function(){
		 ble.startNotification(deviceId, hwDefs.barometer.service, hwDefs.barometer.data, baroCallback, function(error){console.log(error);});
	 };
	 this.disableBaroCallback = function(){
		 ble.stopNotification(deviceId, hwDefs.barometer.service, hwDefs.barometer.data, function(){console.log("Barometer Notifications Stopped");}, function(error){console.log(error);});
	 };
	 this.setBaroPeriod = function(period){
		 //TODO: Add math to calculate period value
		 var periodData = new Uint8Array(1);
		 periodData[0] = period;
		 ble.write(deviceId, hwDefs.barometer.service, hwDefs.barometer.period, periodData.buffer,
		     function() { console.log("Configured barometer period."); },function(error){console.log(error);});
		 
	 };
	 this.enableBaro = function(){
		 var configData = new Uint8Array(1);
		 configData[0] = 1;
		 ble.write(deviceId, hwDefs.barometer.service, hwDefs.barometer.configuration, configData.buffer,
		     function() { console.log("Enabled barometer."); },function(error){console.log(error);});
	 };
	 this.disableBaro = function(){
		 var configData = new Uint8Array(1);
		 configData[0] = 0;
		 ble.write(deviceId, hwDefs.barometer.service, hwDefs.barometer.configuration, configData.buffer,
		     function() { console.log("Disabled barometer."); },function(error){console.log(error);});
	 };
	 
	 //************************************************************************
	 //IR Thermometer Service Functions
	 //************************************************************************
	 var irThermCallback;
	 this.registerThermCallback = function(callback){
		 irThermCallback = callback;
	 };
	 this.enableThermCallback = function(){
		 ble.startNotification(deviceId, hwDefs.irTherm.service, hwDefs.irTherm.data, irThermCallback, function(error){console.log(error);});
	 };
	 this.disableThermCallback = function(){
		 ble.stopNotification(deviceId, hwDefs.irTherm.service, hwDefs.irTherm.data, function(){console.log("irThermometer Notifications Stopped");}, function(error){console.log(error);});
	 };
	 this.setThermPeriod = function(period){
		 //TODO: Add math to calculate period value
		 var periodData = new Uint8Array(1);
		 periodData[0] = period;
		 ble.write(deviceId, hwDefs.irTherm.service, hwDefs.irTherm.period, periodData.buffer,
		     function() { console.log("Configured irTherm period."); },function(error){console.log(error);});
	 };
	 this.enableTherm = function(){
		 var configData = new Uint8Array(1);
		 configData[0] = 1;
		 ble.write(deviceId, hwDefs.irTherm.service, hwDefs.irTherm.configuration, configData.buffer,
		     function() { console.log("Enabled irTherm."); },function(error){console.log(error);});
	 };
	 this.disableTherm = function(){
		 var configData = new Uint8Array(1);
		 configData[0] = 0;
		 ble.write(deviceId, hwDefs.irTherm.service, hwDefs.irTherm.configuration, configData.buffer,
		     function() { console.log("Disabled irTherm."); },function(error){console.log(error);});
	 };
	 
	 
	 //************************************************************************
	 //IO Service Functions
	 //************************************************************************
	 this.enableLEDControl = function(){
	     var ioConfig = new Uint8Array(1);
	     ioConfig[0] = 1; //Enable LED Remote Control
	     ble.write(deviceId, hwDefs.io.service, hwDefs.io.configuration, ioConfig.buffer, 
	     	function() { console.log("Enabled LED Control."); }, app.onError);
	 };
	 this.diableLEDControl = function(){
		 setLEDColor(0,0,0);
	     var ioConfig = new Uint8Array(1);
	     ioConfig[0] = 0; //Disable LED Remote Control
	     ble.write(deviceId, hwDefs.io.service, hwDefs.io.configuration, ioConfig.buffer, 
	     	function() { console.log("Disabled LED Control."); }, app.onError);
	 };
	 this.setLEDColor = function(red, green, blue){
	        var ioValue = new Uint8Array(3);
	        ioValue[0] = red; //Set red value
	        ioValue[1] = green; //Set red value
	        ioValue[2] = blue; //Set red value
	        ble.write(deviceId, hwDefs.io.service, hwDefs.io.data, ioValue.buffer, 
	        		function(){console.log("Sent LED Color.");}, app.onError);
	 };
	 
	 //************************************************************************
	 //Button Service Functions
	 //************************************************************************
	 var buttonCallback;
	 this.registerButtonCallback = function(callback){
		 buttonCallback = callback;
	 };
	 this.enableButtonCallback = function(){
		 ble.startNotification(deviceId, hwDefs.button.service, hwDefs.button.data, buttonCallback, function(error){console.log(error);});
	 };
	 this.disableButtonCallback = function(){
		 ble.stopNotification(deviceId, hwDefs.button.service, hwDefs.button.data, function(){console.log("Button Notifications Stopped");}, function(error){console.log(error);});
	 };

	
};
