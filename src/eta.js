
(function () {

var mplayer = document.getElementById('movie_player');

var POLL_INTERVAL = 200;
var safetyCounter = 5000/POLL_INTERVAL; // 5 seconds

var NO_WATCH_COLOR = 'rgba(255,0,0,50)';
var OK_WATCH_COLOR = 'rgba(255,128,0,50)';

if(mplayer === null) return;

ETA = '<b>ETA</b>&nbsp;';

div = document.createElement('div');
div.id = 'etabanner';
div.style.position = 'absolute';
div.style.width  = '130px';
div.style.height = '1.5em';
div.style.left = '3px';
div.style.top = '3px';
div.style.backgroundColor = NO_WATCH_COLOR;
div.style.padding = '3px';
div.style.fontSize = '18px';
div.style.fontFamily = 'MS Trebuchet, Verdana, Sans Serif';
div.style.color = '#000';
div.style.webkitBorderRadius = '5px';
div.style.border = '2px #888 solid';
div.style.whiteSpace = 'nowrap';
div.innerHTML = ETA;

document.body.appendChild(div);

var timer = setInterval(updateETA, 200);
var startTS = new Date().getTime();
var stopFlag = false;
var videoDuration;

function updateETA() {
  var mplayer = document.getElementById('movie_player');
  var div = document.getElementById('etabanner');

  if(mplayer.getPlayerState() === 1 && !stopFlag) {
    mplayer.pauseVideo();
    stopFlag = true;
    videoDuration = mplayer.getDuration(); // in seconds
  }

  var loaded = mplayer.getVideoBytesLoaded();
  var total = mplayer.getVideoBytesTotal();
  var percentage = 100 * loaded / total;

  var elapsed = (new Date().getTime() - startTS) / 1000; // seconds
  var bps = loaded / elapsed; // bytes per sec
  var eta = parseInt((total - loaded) / bps);  // seconds

  var videoCurrent = mplayer.getCurrentTime(); // in seconds
  var okToWatch = ( eta < (videoDuration - videoCurrent) ) 
    
  var eta_hr = 0, eta_min = 0, eta_sec = eta;
  if(eta_sec > 60) {
    eta_min = parseInt(eta_sec/60);
    eta_sec = eta_sec % 60;

    if(eta_min > 60) {
      eta_hr = parseInt(eta_min/60);
      eta_min = eta_min % 60;
    }
  }

  var timestamp = '';
  if(eta_hr > 0) {
    timestamp += eta_hr+'h';
    timestamp += '&nbsp;'
  }
  if(eta_min > 0) {
    timestamp += eta_min+'m';
    timestamp += '&nbsp;'
  }
  if(eta_sec > 0 && eta_hr === 0) {  // hours make seconds insignificant
    timestamp += eta_sec+'s';
  }
  div.innerHTML = ETA + timestamp;

  var title_timestamp = '';
  if(eta_hr !== 0) {
    title_timestamp = eta_hr+'h';
  } else {
    if(eta_min !== 0) {
      title_timestamp = eta_min+'m';
    } else {
      if(eta_sec !== 0) {
        title_timestamp = eta_sec+'s';
      }
    }
  }
  if(okToWatch) {
    title_timestamp += '*';
  }
  var doctitle;
  if(/\[.*\](.*)/.test(document.title)) {
    doctitle = /\[.*\](.*)/.exec(document.title)[1];
  } else {
    doctitle = document.title;
  }
  document.title = '['+title_timestamp+'] '+doctitle;

  if(loaded === total && safetyCounter-- <= 0) {
    clearInterval(timer);
    div.style.display = 'none';
    if(/\[.*\](.*)/.test(document.title)) {
      document.title = /\[.*\](.*)/.exec(document.title)[1];
    }
  } else {

    if(okToWatch) {
      div.style.backgroundColor = OK_WATCH_COLOR;
      div.innerHTML += '<br/><b>OK</b> to start';
      div.style.height = '3em';
      div.style.whiteSpace = 'normal';
    } else {
      div.style.backgroundColor = NO_WATCH_COLOR;
      div.style.whiteSpace = 'nowrap';
    }

  }
}

})();
