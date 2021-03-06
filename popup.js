Element.prototype.remove = function () {
   this.parentElement.removeChild(this)
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
   for (var i = 0, len = this.length; i < len; i++)
       if (this[i] && this[i].parentElement) this[i].parentElement.removeChild(this[i])
};
function formatAMPM(date) {
 var hours = date.getHours(),
     minutes = date.getMinutes(),
     dmy=((new Date().getMonth())+1)+'/'+ new Date().getDate() +'/'+ new Date().getFullYear(),
     ampm = hours >= 12 ? 'pm' : 'am';
 hours = hours % 12;
 hours = hours ? hours : 12; // the hour '0' should be '12'
 minutes = minutes < 10 ? '0'+minutes : minutes;
 
 var strTime = dmy + '&nbsp;&nbsp;&nbsp;&nbsp;' + hours + ':' + minutes + ' ' + ampm;
 return strTime;
}

function init() {
   var active;
   chrome.tabs.query({
       currentWindow: true,
       active: true
   }, function (tabs) {
       active = tabs[0].id
   });
   chrome.windows.getCurrent({
       populate: true
   }, function (currentWindow) {
       var arr = new Array;
       for (var i = 0; i < currentWindow.tabs.length; i++) {
           if (currentWindow.tabs[i].url.indexOf("chrome://") == -1) arr.push(currentWindow.tabs[i].url);
           if (currentWindow.tabs[i].id != active) chrome.tabs.remove(currentWindow.tabs[i].id)
       }
       chrome.tabs.update(active, {
           url: "http://www.google.com"
       });
       arr.unshift(formatAMPM(new Date));
       var master = {};
       chrome.storage.local.get({
           v: []
       }, function (items) {
           master = items.v;
           master.push(arr);
           chrome.storage.local.set({
               "v": master
           })
       })
   })
}
document.addEventListener("DOMContentLoaded", function () {
   var t,
       gmaster,
       tabH,
       tset,
       cover = document.getElementById("cover"),
       body = document.getElementsByTagName("body")[0],
       history = document.getElementById("history"),
       smenu = document.getElementById("setmenu"),
       divs = document.getElementsByClassName("main");
   cover.style.display = "none";
   for (var i = 0; i < divs.length; i++) divs[i].addEventListener("click", click);

   function click(e) {
       if (e.target.id == "saved") {
           body.style.width = "700px";
           body.style.height ="800px";
body.style.overflow = "auto";
           history.style.display = "block";
           chrome.storage.local.get({
               v: []
           }, function (items) {
               var tabH = items.v;
               for (var i = tabH.length - 1; i >= 0; i--) {
                   var newSpan = document.createElement("span");
                   var newBr = document.createElement("br");
                   history.appendChild(newSpan);
                   history.appendChild(newBr);
                   newSpan.insertAdjacentHTML("afterbegin", "<p >" + tabH[i][0] + "</p>");
                   newSpan.insertAdjacentHTML("afterbegin", '<div id="' + i + '" class="restore" >Restore All</div>');
                   for (var n = 1; n < tabH[i].length; n++) newSpan.insertAdjacentHTML("beforeend",
                       "<a href=" + tabH[i][n] + ' target="_blank">' + tabH[i][n] + "</a></br>")
               }
               var restore = document.getElementsByClassName("restore");
               for (var u = 0; u < restore.length; u++) restore[u].addEventListener("click", restoreclick);

               function restoreclick(e) {
                   var elnum = e.target.id;
                   var his = tabH[elnum];
                   for (var r = 1; r < his.length; r++) chrome.tabs.create({
                       url: his[r],
                       active: false
                   })
               }
           })
       } else if (e.target.id == "closeall") init();
       else if (e.target.id == "setups") {
           body.style.width = "350px";
           body.style.height = "400px";
body.style.overflow = "auto";
           smenu.style.display = "block";
           t = true;
           populate();
           document.getElementById("trash").addEventListener("click", trash);
           document.getElementById("cur").addEventListener("click", function () {
               cover.style.display = "block";
               document.getElementById("cancel").addEventListener("click", function () {
                   cover.style.display = "none"
               });
               document.getElementById("save").addEventListener("click", tabget)
           });

           function trash() {
               var button = document.getElementsByClassName("close");
               if (t) {
                   for (var i = 0; i < button.length; i++) {
                       button[i].style.display = "block";
                       button[i].addEventListener("click",
                           remove)
                   }
                   t = false
               } else {
                   t = true;
                   for (var i = 0; i < button.length; i++) button[i].style.display = "none";
               }
           }

           function remove(e) {
               var ev = e.target.id;
               var master = {};
               chrome.storage.local.get({
                   r: []
               }, function (items) {
                   master = items.r;
                   master.splice(ev, 1);
                   chrome.storage.local.set({
                       "r": master
                   }, function () {
                       populate()
                   })
               })
           }

           function tabget() {
               chrome.windows.getCurrent({
                   populate: true
               }, function (currentWindow) {
                   var arr = new Array;
                   for (var i = 0; i < currentWindow.tabs.length; i++)
                       if (currentWindow.tabs[i].url.indexOf("chrome://") == -1) arr.push(currentWindow.tabs[i].url);
                   var sval = document.getElementById("name").value;
                   document.getElementById("name").value = "";
                   arr.unshift(sval);
                   cover.style.display = "none";
                   var master = {};
                   chrome.storage.local.get({
                       r: []
                   }, function (items) {
                       master = items.r;
                       master.push(arr);
                       chrome.storage.local.set({
                           "r": master
                       }, function () {
                           populate()
                       })
                   })
               })
           }
       }
   }

   function populate(e) {
       var land = document.getElementById("land");
       if (land != null) land.remove();
       var master = {};
       chrome.storage.local.get({
           r: []
       }, function (items) {
           master = items.r;
           gmaster = master;
           document.getElementById("setmenu").insertAdjacentHTML("beforeend",
               '<span id="land" ></span>');
           for (var i = master.length - 1; i >= 0; i--) document.getElementById("land").insertAdjacentHTML("beforeend", '<div class="gendiv" id="' + i + '"  >' + master[i][0] + '<img id="' + i + '" src="closeButton.png" class="close"/> </div>');
           for (var i = master.length - 1; i >= 0; i--) document.getElementsByClassName("gendiv")[i].addEventListener("click", direct)
       })
   }
   var arrows = document.getElementsByClassName("arrow");
   for (var i = 0; i < 2; i++) arrows[i].addEventListener("click", aclick);

   function aclick(e) {
       location.reload()
   }

   function direct(e) {
       var w = e.target.id;
       if (t) {
           var q = gmaster[w];
           for (var r = 1; r < q.length; r++) chrome.tabs.create({
               url: q[r],
               active: false
           })
       }
   }
});
