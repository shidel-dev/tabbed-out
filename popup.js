function init() {
var active;
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  active=tabs[0].id;
});

    chrome.windows.getCurrent({
        populate: true
    }, function (currentWindow) {
        var arr = new Array();
        for (var i = 0; i < currentWindow.tabs.length; i++) {
           if (currentWindow.tabs[i].url.indexOf("chrome://") == -1)
            arr.push(currentWindow.tabs[i].url);

            if (currentWindow.tabs[i].id != active){
            chrome.tabs.remove(currentWindow.tabs[i].id);
        }
        }
        chrome.tabs.update(active,{url:"http://www.google.com"});
        
        arr.unshift(String(new Date()));
        var master = {};
        chrome.storage.local.get({
            v: []
        }, function (items) {

            master = items.v;
            master.push(arr);


           


            chrome.storage.local.set({
                'v': master
            });



        });
    });
}

document.addEventListener('DOMContentLoaded', function () {


    var history = document.getElementById('history');
    var divs = document.getElementsByClassName('main');
    for (var i = 0; i < divs.length; i++) {
        divs[i].addEventListener('click', click);
    }
  
    function click(e) {


        if (e.target.id == "saved") {

            var body = document.getElementsByTagName('body')[0];
            body.style.width = '700px';
            body.style.height = '800px';

            history.style.display = 'block';
            chrome.storage.local.get({
                v: []
            }, function (items) {
                var tabH = items.v;
              
                for (var i = tabH.length-1; i > 0; i--) {

                    var newSpan = document.createElement("span");
                    var newBr = document.createElement("br");

                    history.appendChild(newSpan);
                    history.appendChild(newBr);
                    newSpan.insertAdjacentHTML('afterbegin', '<p >' + tabH[i][0] + '</p>');
                    newSpan.insertAdjacentHTML('afterbegin', '<div id="' + i + '" class="restore" >Restore All</div>');
                    for (var n = 1; n < tabH[i].length; n++) {
                       

                        newSpan.insertAdjacentHTML('beforeend', '<a href=' + tabH[i][n] + ' target="_blank">' + tabH[i][n] + '</a></br>');
                    }

                }



                var restore = document.getElementsByClassName('restore');
         
                for (var u = 0; u < restore.length; u++) {


                    restore[u].addEventListener('click', restoreclick);
                }

                function restoreclick(e) {
                   
                    var cid = e.target.id;

                    var his = items.v[cid];
                    chrome.extension.getBackgroundPage().console.log(his);
                   chrome.extension.getBackgroundPage().console.log(cid);
                    chrome.extension.getBackgroundPage().console.log(his.length);

                    for (var r = 1; r < his.length; r++) {
                   chrome.extension.getBackgroundPage().console.log(r);
                        chrome.tabs.create({url: his[r],active:false})
                    }

                }



            })




        } else if (e.target.id == "closeall") {

            init();


        }

    };


});








