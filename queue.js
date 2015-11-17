//Set chrome API variables for ease of use
var storage = chrome.storage.local;
var tabs = chrome.tabs;

var UrlQueue = {
	init: function() {
		var me = this;
		document.body.onkeydown = function(e) {
			var k = me.getKeyPress(e);
			var r = document.getElementById('queue_table').getElementsByTagName('TR');
			var a = document.getElementsByTagName('A');
			var limit = r.length - 1;
			
			if (k == 40 || k == 38) {
				if (me.rowHighlighted == null) { 
					me.rowHighlighted = -1; 
				} else {
					r[me.rowHighlighted].className = '';
				}
			
				if (k == 40) {
					if (++me.rowHighlighted > limit) me.rowHighlighted = limit;
				} else if (k == 38) {
					if (--me.rowHighlighted < 0) me.rowHighlighted = 0;
				}
				
				r[me.rowHighlighted].className = 'selected';
			}
			
			if (k == 13) {
				var id = r[me.rowHighlighted].id;
				var url = a[me.rowHighlighted].href;
				me.removeQueueElement(id);
				tabs.create({"url":url});
			}
		};
		this.loadQueue();
	},
	
	loadQueue: function() {
		var me = this;
		storage.get("urlQueue", function(items) {
			if (items.urlQueue && items.urlQueue.length > 0) {
				var table = document.createElement('table');
				table.id = 'queue_table';
				for (var i=0; i<items.urlQueue.length; i++) {
					var id = items.urlQueue[i].timestamp;
					var timestamp = new Date(id);
					var url = items.urlQueue[i].url;
					var title = items.urlQueue[i].title;
				
					var tr = document.createElement('tr');
					tr.onmouseover = function() {
						var trs = document.getElementsByTagName('TR');
						this.className = 'selected';
						for (var i=0;i<trs.length;i++) {
							if (trs[i].id == this.id) me.rowHighlighted = i;
						}
					};
					tr.onmouseout = function() {
						this.className = '';
						me.rowHighlighted = null;
					};
					tr.id = id;
					var td1 = document.createElement('td');
					var td2 = document.createElement('td');
					var td3 = document.createElement('td');
					var a = document.createElement('a');
					a.href = url;
					a.onclick = function(){
						me.removeQueueElement(this.parentNode.parentNode.id);
						tabs.create({"url":this.href});
					};
					a.innerHTML = title;
					td1.appendChild(a);
					td1.setAttribute('style','width:225px;font-size:small;');
					td2.innerHTML = (timestamp.getMonth()+1) + '/' + timestamp.getDate() + '/' + timestamp.getFullYear() + ' ' + timestamp.getHours() + ':' + timestamp.getMinutes();
					td2.setAttribute('style','color:gray;font-size:x-small;width:85px;');
					td3.innerHTML = 'X';
					td3.onclick = function() {
						me.removeQueueElement(this.parentNode.id);
						table.removeChild(this.parentNode);
						if (table.getElementsByTagName('TR').length == 0) {
							document.body.removeChild(table);
							me.displayNoItems();
						}
					};
					td3.onmouseover = function() {
						this.className = 'pointy';
					};
					td3.setAttribute('style','width:45px;color:red;font-weight:bold;text-align:center;');
					tr.appendChild(td1);
					tr.appendChild(td2);
					tr.appendChild(td3);
					table.appendChild(tr);
				}
				document.body.appendChild(table);
			} else {
				me.displayNoItems();
			}
		});
	},
	
	displayNoItems: function() {
		var p = document.createElement('p');
		p.innerHTML = 'No items in queue';
		document.body.appendChild(p);
	},
	
	removeQueueElement: function(id) {
		storage.get("urlQueue", function(items) {
			if (items.urlQueue) {
				console.log(id);
				for(var i=0;i<items.urlQueue.length;i++) {
					if (items.urlQueue[i].timestamp == id) {
						items.urlQueue.splice(i,1); 
					}
				}
				storage.set({"urlQueue":items.urlQueue});
			} else {
				console.log("Cannot find item to delete");
			}
		});
	},
	
	getKeyPress: function(e) {
		var keynum;
		
		if (e.which)
			keynum = e.which;
		
		return keynum;
	}
};

document.addEventListener('DOMContentLoaded', function() {
	UrlQueue.init();
});