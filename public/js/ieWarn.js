/**
 * Created by waiwai on 17-7-18.
 */
(function(){
    var browser=navigator.appName;
    var b_version=navigator.appVersion;
    var version=b_version.split(";");
    var trim_Version=version[1].replace(/[ ]/g,"");
    if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE8.0") {
        var ieDisplay= document.getElementById('ieDisplay');
        ieDisplay.style.display="block";
    }
})()