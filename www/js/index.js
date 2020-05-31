// this gets the value of the field, takes html ID and returns the value
function get_name_value(fieldName) {
    var value = document.getElementById(fieldName).value;
    return value;

};
//this creates the timestamp ex 120320154622 for 12 March 2020 15:46:22
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
        //on ready the two fields for input will be disabled until name is saved
        document.getElementById('MACInput').disabled = true; 
        document.getElementById('scanCode').disabled = true; 
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
       //storage initialisation
       var storage = window.localStorage;
       // currentLocation is stored as a global variable so that updates to the local storage are possible
       var currentLocation;
       //this adds new name as a key to local storage with empty value. it also sets the currentLocation
       function addNewCollection(name){
           currentLocation = name;
           storage.setItem(name, []);
        
       };
       //this function "builds up" the value of the current key, by adding new values to the end
       function addMACToCollection(host, model){
           
       
        let existing = storage.getItem(currentLocation);
        //check for non emptiness of the currentLocation value to avoid adding comma at the front
        if(existing.lenght!==0){
        existing = `,${existing} ${model} ${host},`;
        
        storage.setItem(currentLocation, existing);
        }
        //case for locations not previously existing in localStorage
        else{
            existing = `${existing} ${model} ${host},`;
        
        storage.setItem(currentLocation, existing);

        }
       };
        //this exports contents of local storage as a CSV and saves it as CSV in Download folder                                      
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
             // iterating over the local storage
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
       /**  
        * STUB functions for alter
        * function register(oucu) {};
        *       
        * function volunteer(oucu, address, start_time, end_time) {};
        *
        *
        * function request(oucu,address,start_time) {};
        *
        * function cancel(oucu) {};
        */  
       
        function Collector(){

            // These varibles are private
            var collectorObject = {};
         

            //Changes the UI once the name is saved 
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
            //takes the valuse that are typed and cleans the input field
            collectorObject.saveTypedValue = function(){
                let MAC = document.getElementById("MACInput").value;
                this.addOnScreen(MAC);
                document.getElementById("MACInput").value="";
            }
            //Creates ordered list of elements being added on the go
            collectorObject.addOnScreen = function(MAC){
                var model ="";
                MAC = MAC.replace(/:/g,"").toUpperCase();
                var host;
                function createListElement(model, host){
                    let node = document.createElement("OL");
                    let textNode = document.createTextNode(`${model}   ${host}`);
                    node.appendChild(textNode);
                    document.getElementById("results").appendChild(node);
                    addMACToCollection(host, model);

                }
                // strong valid enabled
                if(MAC.length === 12 || MAC.length ===17 || MAC.length===8){
                //if(MAC.length !==0){ debug validation
                    if(MAC.substring(0,4)==="6C2B"){
                        model = "";
                        host = `${MAC}.luht.scot.nhs.uk`;
                        createListElement(model,host);

                    }
                    else if(MAC.substring(0,6)==="00074D"){
                        model = "Zebra";
                        host = MAC;
                        createListElement(model,host);
                    }
                    else if(MAC.substring(0,2)=="AS"){
                        model = "Desktop";
                        host = `${MAC}.luht.scot.nhs.uk`;
                        createListElement(model,host);
                    }
                    else {
                        //for confirming the Host or Printer prompt
                        function onConfirmHorP(n){
                            
                            if(n===1){
                                host = `${MAC}.luht.scot.nhs.uk`;
                                model = "";
                                console.log(model);
                                console.log(host);
                                createListElement(model,host);

                            }
                            else{
                                console.log("congratulations it's a printer!")
                                model = prompt("Please enter the detailed model", "Ricoh or HP");
                                console.log(model);
                                host = MAC;
                                console.log(model);
                                console.log(host);
                                createListElement(model,host);
                            }

                        }
                        navigator.notification.confirm("Is this a VD or a printer?", onConfirmHorP, "Role of the asset", ["Thin client","Printer"]);
                        console.log(model);
                        console.log(host);
                        
                    }
                    
                
               
                
                }
                else{
                    alert("Try again with a valid MAC!");
                }
            };

            //this calls the Barcode scanner plugin 
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
                        saveHistory: false, // Android, save scan history (default false)
                        prompt : "Place the barcode or QR in scanning area", // Android
                        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                        //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                        //orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                        disableAnimations : true, // iOS
                        disableSuccessBeep: true // iOS and Android
                    }
                 );
                 
            };

            //Clers the LocalStorage, asks for confirmation first
            collectorObject.clearStorage = function (){
                if (confirm('Are you sure you want to clear the storage?')) {
                    storage.clear();
                    
                  } else {
                    // Do nothing!
                    console.log('Not cleared');
                  }
                
            };
           
            //this reloads the html index page so that the UI is blank and collecting for new location is possible
            collectorObject.startNewArea = function (){
                location.reload();
                return false;
            };

            //calls the export function in app object unless localStorage is empty
            collectorObject.exportAll = function (){
               if(storage.length!==0){
                createExportFile();
                alert("CSV file created, check Downloads folder.")
               }
               else{
                  alert("Oops, there is nothing in storage, check the files");
               }

            };
            
            //Handy stub
            collectorObject.cancel = function (){};

            //return the intialised object
            return collectorObject;
        }

        this.collector = new Collector();
                
                }

};
app.initialize();
