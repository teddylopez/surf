function realtimeClock() {
  var time = new Date();
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var seconds = time.getSeconds();

  // Pad hours, min, seconds with leading 0s:
  hours = ("0" + hours).slice(-2);
  minutes = ("0" + minutes).slice(-2);
  seconds = ("0" + seconds).slice(-2);

  // Display time:
  var timeSpot = (document.getElementById("realtime").innerHTML =
    hours + "  :  " + minutes + "  :  " + seconds);

  var t = setTimeout(realtimeClock, 500);
}
