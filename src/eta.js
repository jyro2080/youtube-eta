
(function () {

var POLL_INTERVAL = 200;
var safetyCounter = 10000/POLL_INTERVAL; // 5 seconds
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

  if(mplayer.currentTime > 0 && !stopFlag) {
    mplayer.pause();
    stopFlag = true;
    videoDuration = mplayer.duration;
  }

  var loaded = mplayer.buffered.end(0);
  var total = videoDuration;

  var eta = calculate_eta(loaded, total);

  var okToWatch = ( eta < (videoDuration - mplayer.currentTime) ) 

  var timestamp = compose_timestamp(eta);

  display(loaded, total, okToWatch, timestamp);
}

function updateETAFlash() {

  if(mplayer.getPlayerState() === 1 && !stopFlag) {
    mplayer.pauseVideo();
    stopFlag = true;
    videoDuration = mplayer.getDuration(); // in seconds
  }

  var loaded = mplayer.getVideoBytesLoaded();
  var total = mplayer.getVideoBytesTotal();

  var eta = calculate_eta(loaded, total);

  var videoCurrent = mplayer.getCurrentTime(); // in seconds
  var okToWatch = ( eta < (videoDuration - videoCurrent) ) 
    
  var timestamp = compose_timestamp(eta);

  display(loaded, total, okToWatch, timestamp);
}

function calculate_eta(loaded, total) {
  var elapsed = (new Date().getTime() - startTS) / 1000; // seconds
  var bps = loaded / elapsed; // bytes per sec
  return parseInt((total - loaded) / bps);  // seconds
}

function compose_timestamp(eta) {

  var eta_hr = 0, eta_min = 0, eta_sec = eta;
  if(eta_sec > 60) {
    eta_min = parseInt(eta_sec/60);
    eta_sec = eta_sec % 60;

    if(eta_min > 60) {
      eta_hr = parseInt(eta_min/60);
      eta_min = eta_min % 60;
    }
  }

  // Long timestamp for banner
  var longts = '';
  if(eta_hr > 0) {
    longts += eta_hr+'h';
    longts += '&nbsp;'
  }
  if(eta_min > 0) {
    longts += eta_min+'m';
    longts += '&nbsp;'
  }
  if(eta_sec > 0 && eta_hr === 0) {  // hours make seconds insignificant
    longts += eta_sec+'s';
  }

  // Short timestamp for title
  var shortts = '';
  if(eta_hr !== 0) {
    shortts = eta_hr+'h';
  } else {
    if(eta_min !== 0) {
      shortts = eta_min+'m';
    } else {
      if(eta_sec !== 0) {
        shortts = eta_sec+'s';
      }
    }
  }

  return { long_ : longts, short_ : shortts };
}

function display(loaded, total, okToWatch, timestamp) {

  banner.innerHTML = ETA + timestamp.long_;
  var title_timestamp = timestamp.short_;

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

