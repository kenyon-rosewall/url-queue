//Set chrome API variables for ease of use
var storage = chrome.storage.local;
var menus = chrome.contextMenus;
var tabs = chrome.tabs;

chrome.commands.onCommand.addListener(function(command) {
	if (command == "add_page") {
		tabs.query({active: true}, function(t) {
			addPageToQueue(null, t[0]);
		});
	}
});

//Create a context menu when right-clicking on links and pages
var cmId1 = menus.create({"title": "Add to queue", "contexts": ["link"], "onclick": addToQueue});
var cmId2 = menus.create({"title": "Add page to queue", "contexts": ["page"], "onclick": addPageToQueue});
var cmId3 = menus.create({"title": "Clear queue", "contexts": ["page"], "onclick": removeQueue});

//Add link to queue
function addToQueue(info, tab) {
	//Get the time it was added and the url
	var timestamp = Date.now();
	var url = info.linkUrl;
	//Get the title of the page being queued
	getTitle(timestamp,url);
}

//Add current page to queue
function addPageToQueue(info, tab) {
	//Get the time, url and title from the tab object
	var timestamp = Date.now();
	var url = tab.url;
	var title = tab.title;
	
	//Add data in JSON object to save to local storage
	var dataToAdd = {
		"timestamp": timestamp,
		"url": url,
		"title": title
	};
	
	//Save to local storage
	saveStorage(dataToAdd);
}

//For links, get the title with the XMLHttpRequest object
function getTitle(timestamp,url) {
	//Create a XMLHttpRequest object to download the HTML
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState==4 && req.status==200) {
			//When we successfully get the HTML, use regex to get the <title> tag
			var title = (req.responseText.replace( /<!\[CDATA\[(.+?)\]\]>/g
                      , function (_match, body) {
                          return body.replace(/&/g, '&amp;')
                                     .replace(/</g, '&lt;')
                                     .replace(/>/g, '&gt;')
                        } )
              .replace(/<!--.+?-->/g, '')
              .match(/<title>.+?<\/title>/ig) || [])
              .map(function (t) { return t.substring(7, t.length - 8) })
              .join(' ');
			  
			if(title=='') title = url;
			  
			//Add data in JSON object to save to local storage
			var dataToAdd = {
				"timestamp": timestamp,
				"url": url,
				"title": title
			};
			
			//Save to local storage
			saveStorage(dataToAdd);
		}
	}
	req.open("GET",url,true);
	req.send(null);
}

//Save the JSON object to local storage
function saveStorage(dataToAdd) {
	var data;
	//Search for the urlQueue object in local storage
	storage.get("urlQueue", function(items) {
		//If it already exists, add the newest JSON object to the end and save it
		if(items.urlQueue) {
			data = items.urlQueue;
			data.push(dataToAdd);
			storage.set({"urlQueue": data}, function() {
				console.log("Data stored to local storage");
			});
		//If it doesn't exist, create it and save it
		} else {
			data = [dataToAdd];
			storage.set({"urlQueue": data}, function() {
				console.log("Data created and stored to local storage");
			});
		}
		
		if (data)
			sendMessage("Added page to URL Queue");
	});
}

//Clear the entire queue
function removeQueue() {
	storage.remove("urlQueue", function() {
		console.log("Removed queue from local storage");
		sendMessage("Cleared entire URL Queue");
	});
}

//Send message to user
function sendMessage(m) {
	//alert(m);
}