
var dbversion = 1.0;
var request = null;
var db = null;


function initIdxDB(){
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	 
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
	 
	if (!window.indexedDB) {
	   window.alert("Your browser doesn't support a stable version of IndexedDB.")
	   return;
	}

	request = indexedDB.open("pdi_images", dbversion);

	request.onsuccess = function(event){
		console.log("Success creating/accessing IndexedDB database");
		db = request.result;
		db.onerror = function(event) {
			console.log("Error creating/accessing IndexedDB database");
		}

		if (db.setVersion) {
			if (db.version != dbversion) {
				var setVersion = db.setVersion(dbversion);
				setVersion.onsuccess = function() {
					createObjectStore(db);
					getImageFile();
				}
			} else {
				getImageFile();
			}
		} else {
			getImageFile();
		}
	}


	request.onupgradeneeded = function(event) {
		createObjectStore(event.target.result);
	}

}
