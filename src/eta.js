
(function () {

var POLL_INTERVAL = 200;
var SAFETY_INTERVAL = 15000;
ETA = '<b>ETA</b>&nbsp;';
var banner, mplayer, stopFlag, timer, startTS;
var notificationShown = false;
var videoDuration;

setTimeout(start, 1000);

function start() {
  if(/ted.com/.test(window.location.hostname)) {
    mplayer = document.getElementById('tedHTML5');
    if(mplayer) {
      var isFlashPlayer = false;
    } else {
      return;
    }
  } else if(/youtube.com/.test(window.location.hostname)) {
    mplayer = document.getElementById('movie_player');
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
  } else if(/vimeo.com/.test(window.location.hostname)) {
    var vimeo_tries = 0;
    var max_vimeo_tries = 30;
    function check_for_video() {
      var mplayers = document.getElementsByTagName('video');
      if(mplayers.length > 0) {
        mplayer = mplayers[0];
        var isFlashPlayer = false;
        clearInterval(vimeo_checker); 
      }
      vimeo_tries++;
      if(vimeo_tries >= max_vimeo_tries) {
        clearInterval(vimeo_checker); 
      }
    }
    var vimeo_checker = setInterval(check_for_video, 2000);
  } else {
    var mplayers = document.getElementsByTagName('video');
    if(mplayers.length > 0) {
      mplayer = mplayers[0];
      var isFlashPlayer = false;
    } else {
      return;
    }
  }

  banner = document.createElement('div');
  banner.id = 'etabanner';
  banner.setAttribute('class','notenough');
  banner.innerHTML = ETA;
  document.body.appendChild(banner);

  timer = setInterval(isFlashPlayer ? updateETAFlash : updateETAHtml5, 200);
  startTS = new Date().getTime();
  stopFlag = false;

  askForNotifications();
  mplayer.play();
}

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

  if(loaded === total && totalLifeTime() > SAFETY_INTERVAL) {
    clearInterval(timer);
    banner.style.display = 'none';
    if(/\[.*\](.*)/.test(document.title)) {
      document.title = /\[.*\](.*)/.exec(document.title)[1];
    }
  } else {

    if(okToWatch) {
      banner.innerHTML += '<br/>OK to start';
      banner.setAttribute('class','enough');
      showNotification();
    } else {
      banner.setAttribute('class','notenough');
    }
  }
}

function askForNotifications() {
  if (window.webkitNotifications.checkPermission() != 0) { // 0 is PERMISSION_ALLOWED
    banner.innerHTML += '<br/><a style="font-size:80%;" href="#" id="etanotiperm">'+
      'Enable Notifications</a>';
    banner.setAttribute('class','tall');
    document.getElementById('etanotiperm').addEventListener('click', 
      function() {
        window.webkitNotifications.requestPermission();
      }
    );
  }
}

function showNotification() {
  if(!notificationShown) {
    if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
      var doctitle;
      if(/\[.*\](.*)/.test(document.title)) {
        doctitle = /\[.*\](.*)/.exec(document.title)[1];
      } else {
        doctitle = document.title;
      }
      var notification = webkitNotifications.createNotification(
        'http://www.3dtin.com/images/icon128.png',
        'Ready',  // notification title
        doctitle  // notification body text
      );
      notification.show();
      setTimeout(function () { notification.cancel(); }, 10000);
      notificationShown = true;
    }
  }
}

function totalLifeTime() {
  return (new Date().getTime() - startTS);
}

})();

