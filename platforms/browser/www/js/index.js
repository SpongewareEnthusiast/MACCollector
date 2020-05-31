//TODO implement save to file feature
function get_name_value(fieldName) {
    var value = document.getElementById(fieldName).value;
    return value;

};
function createTimestamp(){
    let current_datetime = new Date()
    let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds() 
   return formatted_date;
}
  
  /**
   * This is the main class
   */
  var app = {
    initialize: function() {
        document.addEventListener(
            "deviceready",
            this.onDeviceReady.bind(this),
            false

            
        );
        },
    // deviceready Event Handler
    onDeviceReady: function() {
        this.receivedEvent("deviceready");
        console.log("I am ready");
        console.log(cordova.file);
        document.getElementById('MACInput').disabled = true; 
                document.getElementById('scanCode').disabled = true; 
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
           
       var storage = window.localStorage;
       var currentLocation;
       
       function addNewCollection(name){
           currentLocation = name;
           storage.setItem(name, []);
        
       };

       function addMACToCollection(host, model){
           
       
        let existing = storage.getItem(currentLocation);
        if(existing.lenght==!0){
        existing = `,${existing} ${model} ${host},`;
        
        storage.setItem(currentLocation, existing);
        }
        else{
            existing = `${existing} ${model} ${host},`;
        
        storage.setItem(currentLocation, existing);

        }
       };
                                              
       function createExportFile() {
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory  + 'Download/', function(dir) {
            //cordova.file.externalDataDirectory revert to
            //${time}
            let time = createTimestamp();
            let filename = "TrakDevices"+ time +".csv";
            
            filename = filename.replace(/[\s:-]/g,"");
            console.log(filename);
            console.log("got main dir", dir);
            dir.getFile(filename, {
              create: true
            }, function(file) {
              console.log("got the file", file);
              logOb = file;
              var csv = "";
              //we should have the same amount of name/cookie fields
              for(var i =0; i<storage.length;i++){
                
              var name = storage.key(i);
              var cookies = storage.getItem(storage.key(i)),
                csv = csv + "" + name + "," + cookies + "\n";
            };
              console.log("csv-" + csv);
              writeLog(csv);
            });
          });
         
          function writeLog(str) {
            if (!logOb) return;
            logOb.createWriter(function(fileWriter) {
              fileWriter.seek(fileWriter.length);
         
              var blob = new Blob([str], {
                type: 'text/plain'
              });
              fileWriter.write(blob);
              console.log("ok, in theory i worked");
            }, fail);
          }
          function fail(e) {
            console.log("FileSystem Error");
            console.dir(e);
        }
        

       };
          
       function register(oucu) {};
               
       function volunteer(oucu, address, start_time, end_time) {};

       
       function request(oucu,address,start_time) {};
         
       function cancel(oucu) {};

       
        function Collector(){

            // These varibles are private
            var collectorObject = {};
         

            //Start updating the map with matches to the request or volunteer
            collectorObject.saveCollectionName= function(){
                var name = document.getElementById("collectionName").value;
                console.log(`Value ${name} have been taken`)
                if(name.length!==0){
                addNewCollection(name);
                document.getElementById("nameContainer").innerHTML = `<h3> Current location: ${name}</h3> `;
                document.getElementById('saveCollectionName').disabled = false; 
                document.getElementById('MACInput').disabled = false; 
                document.getElementById('scanCode').disabled = false; 
                }
                else{
                    alert("Location cannot be empty!");
                }
            };
            collectorObject.saveTypedValue = function(){
                let MAC = document.getElementById("MACInput").value;
                this.addOnScreen(MAC);
                document.getElementById("MACInput").value="";
            }
            //Stop updating the map with matches
            collectorObject.addOnScreen = function(MAC){
                let model ="";
                MAC = MAC.replace(/:/g,"").toUpperCase();
                let host;
                //if(MAC.length === 12 || MAC.length ===17 || MAC.length===8){ strong valid disabled
                if(MAC.length !==0){
                    if(MAC.substring(0,4)==="6C2B"){
                        model = "Wyse";
                        host = `${MAC}.luht.scot.nhs.uk`;

                    }
                    else if(MAC.substring(0,6)==="00074D"){
                        model = "Zebra";
                        host = MAC;
                    }
                    else if(MAC.substring(0,2)=="AS"){
                        model = "Desktop";
                        host = `${MAC}.luht.scot.nhs.uk`;
                    }
                    else {
                        model = prompt("Please enter the detailed model", "Ricoh or HP");
                        console.log(model);
                        host = MAC;
                    }
                    
                
               
                let node = document.createElement("LI");
                let textNode = document.createTextNode(`${model}   ${host}`);
                node.appendChild(textNode);
                document.getElementById("results").appendChild(node);
                addMACToCollection(host, model);
                }
                else{
                    alert("Try again with a valid MAC!");
                }
            };

            //Register a user with the web service
            collectorObject.takeBarCode = function (){
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        alert("Scan collected\n" +
                              "Result: " + result.text + "\n" +
                              "Format: " + result.format 
                              );
                        collectorObject.addOnScreen(result.text);
                        return result

                    },
                    function (error) {
                        alert("Scanning failed: " + error);
                    },
                    {
                        preferFrontCamera : false, // iOS and Android
                        showFlipCameraButton : true, // iOS and Android
                        showTorchButton : true, // iOS and Android
                        torchOn: true, // Android, launch with the torch switched on (if available)
                        saveHistory: true, // Android, save scan history (default false)
                        prompt : "Place the barcode or QR in scanning area", // Android
                        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                        //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                        //orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                        disableAnimations : true, // iOS
                        disableSuccessBeep: true // iOS and Android
                    }
                 );
                 
            };

            //Indicate that the user wants to volunteer to share their taxi
            collectorObject.clearStorage = function (){
                if (confirm('Are you sure you want to clear the storage?')) {
                    storage.clear();
                    console.log('Thing was saved to the database.');
                  } else {
                    // Do nothing!
                    console.log('Thing was not saved to the database.');
                  }
                
            };
           
            //Indicate that the user wants to share a taxi somebody else has booked.
            collectorObject.startNewArea = function (){
                location.reload();
                return false;
            };

            //Cancel all current volunteers and requests for this user.
            collectorObject.exportAll = function (){
               if(storage.length!==0){
                createExportFile();
                alert("CSV file created, check Downloads folder.")
               }
               else{
                  alert("Oops, there is nothing in storage, check the files");
               }

            };
            
            //Cancel all current volunteers and requests for this user.
            collectorObject.cancel = function (){};

            //return the intialised object
            return collectorObject;
        }

        this.collector = new Collector();
                
                }

};
app.initialize();
