
(function () {

var POLL_INTERVAL = 200;
var safetyCounter = 5000/POLL_INTERVAL; // 5 seconds
ETA = '<b>ETA</b>&nbsp;';

var mplayer = document.getElementById('movie_player');

var isFlashPlayer = false;
if(mplayer !== null) {
  isFlashPlayer = true;
} else {
  velems = document.getElementsByTagName('video');
  if(velems.length > 0) {
    mplayer = velems[0];
    isFlashPlayer = false;
  } else {
    // non-video youtube page
    return;
  }
}


var banner = document.createElement('div');
banner.id = 'etabanner';
banner.setAttribute('class','notenough');
banner.innerHTML = ETA;
document.body.appendChild(banner);

var timer = setInterval(isFlashPlayer ? updateETAFlash : updateETAHtml5, 200);
var startTS = new Date().getTime();
var stopFlag = false;
var videoDuration;

function updateETAHtml5() {
}

function updateETAFlash() {

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
  banner.innerHTML = ETA + timestamp;

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
    banner.style.display = 'none';
    if(/\[.*\](.*)/.test(document.title)) {
      document.title = /\[.*\](.*)/.exec(document.title)[1];
    }
  } else {

    if(okToWatch) {
      banner.innerHTML += '<br/><b>OK</b> to start';
      banner.setAttribute('class','enough');
    } else {
      banner.setAttribute('class','notenough');
    }

  }
}

})();
