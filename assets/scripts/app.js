function renderReportPage(id) {
  const loadingContainer = document.querySelector("#loading-container");
  loadingContainer.classList.add("display");
  const map = document.getElementById("map");
  const report = document.getElementById("report");
  map.classList.toggle("hide");
  report.classList.toggle("hide");

  const BASE_REPORT_URL = `http://services.surfline.com/kbyg/spots/reports?spotId=${id}`;
  const BASE_UPCOMING_DAYS_URL = `http://services.surfline.com/kbyg/spots/forecasts/conditions?spotId=${id}&days=6`;
  const upcomingSurf = document.querySelector(".upcoming-surf");
  const upcomingSurfToggle = document.querySelector(".show-upcoming-surf");
  const conditionsLabel = document.querySelector("[data-conditions-label]");

  const currentTempHighElement = document.querySelector(
    "[data-current-temp-high]"
  );
  const currentTempLowElement = document.querySelector(
    "[data-current-temp-low]"
  );
  const windSpeedElement = document.querySelector("[data-wind-speed]");
  const windDirectionText = document.querySelector(
    "[data-wind-direction-text]"
  );
  const windDirectionArrow = document.querySelector(
    "[data-wind-direction-arrow]"
  );

  realtimeClock();

  upcomingSurfToggle.addEventListener("click", () => {
    upcomingSurf.classList.toggle("show-surf");
  });

  // Get current surf report
  getSurf(id, BASE_REPORT_URL).then((surf) => {
    const swell = primarySwell(surf.swells);
    updateSwell(swell);
    updateWind(surf.wind.direction);
    displaySelectedSurf(surf);
  });

  // Get surf reports for next 6 days
  getFutureSurf(id, BASE_UPCOMING_DAYS_URL).then((days) => {
    displayFutureForecast(days);
  });
}

// Assign swell with greatest size as primary swell
function primarySwell(swells) {
  const res = {
    height: -Infinity,
    direction: -Infinity,
    directionMin: -Infinity,
    period: -Infinity,
  };
  swells.forEach((el) => {
    const { height, direction, directionMin, period } = el;
    if (height > res.height) {
      res.height = height;
      res.direction = direction;
      res.directionMin = directionMin;
      res.period = period;
    }
  });
  return res;
}

// Populate surf report fields
function displaySelectedSurf(report) {
  const currentLocation = document.querySelector("[data-current-location]");
  const currentDate = document.querySelector("[data-current-date]");
  const minWaveHeight = document.querySelector("[data-min-height]");
  const maxWaveHeight = document.querySelector("[data-max-height]");
  const humanRelation = document.querySelector("[data-human-relation]");
  const conditions = document.querySelector("[data-conditions]");
  const reportSection = document.querySelector("[data-report-section]");
  const spotInfoSection = document.querySelector("[data-spot-info-section]");
  const airTemp = document.querySelector("[data-air-temp]");
  const waterTempMin = document.querySelector("[data-water-temp-min]");
  const waterTempMax = document.querySelector("[data-water-temp-max]");
  const weatherIcon = document.querySelector("[data-weather]");
  const weatherDesc = document.querySelector("[data-weather-desc]");
  const windSpeed = document.querySelector("[data-wind-speed]");
  const currentTideType = document.querySelector("[data-current-tide-type]");
  const currentTideTime = document.querySelector("[data-current-tide-time]");
  const currentTideHeight = document.querySelector(
    "[data-current-tide-height]"
  );
  const nextTideType = document.querySelector("[data-next-tide-type]");
  const nextTideTime = document.querySelector("[data-next-tide-time]");
  const nextTideHeight = document.querySelector("[data-next-tide-height]");
  const locationMap = document.getElementById("location-map");
  const aboutHeader = document.querySelector("[data-spot-info-header]");

  currentLocation.innerText = report.spot_info["name"];
  currentDate.innerText = report.date;
  conditions.innerText = formatConditions(report.conditions);
  minWaveHeight.innerText = report.waveHeight.min;
  maxWaveHeight.innerText = report.waveHeight.max;
  humanRelation.innerText = report.waveHeight.humanRelation;
  reportSection.innerHTML = report.report.body;
  airTemp.innerText = report.weather.temperature;
  waterTempMin.innerText = report.waterTemp.min;
  waterTempMax.innerText = report.waterTemp.max;
  weatherIcon.src = `https://wa.cdn-surfline.com/quiver/0.6.2/weathericons/${report.weather.condition}.svg`;
  windSpeed.innerText = report.wind.speed;
  currentTideType.innerText = report.tides.current.type;
  nextTideType.innerText = report.tides.next.type;
  currentTideTime.innerText = styleTime(report.tides.current.timestamp);
  nextTideTime.innerText = styleTime(report.tides.next.timestamp);
  currentTideHeight.innerText = report.tides.current.height;
  nextTideHeight.innerText = report.tides.next.height;
  locationMap.style.backgroundImage = `url("${report.spot_info["image"]}")`;
  spotInfoSection.innerText = report.spot_info["about"];
  aboutHeader.innerText = report.spot_info["name"];
}

function getSurf(spotId, url) {
  const spot = getSpot(spotId);

  // Proxy needed to conform to CSRF standards
  const proxyUrl = "https://ted-proxy.herokuapp.com/";
  const targetUrl = url;

  return fetch(proxyUrl + targetUrl)
    .then((res) => res.json())
    .then((data) => {
      hideLoading();
      const { associated, units, ...surfData } = data;

      const date = new Date(data.report.timestamp * 1000)
        .toString()
        .split(" ", 4)
        .join(" ");

      return {
        spot_info: spot,
        date: date,
        conditions: data.forecast.conditions.value,
        swells: data.forecast.swells,
        tides: data.forecast.tide,
        waterTemp: data.forecast.waterTemp,
        waveHeight: data.forecast.waveHeight,
        weather: data.forecast.weather,
        wind: data.forecast.wind,
        report: data.report,
      };
    });
}

function getFutureSurf(spotId, url) {
  const spot = getSpot(spotId);
  const proxyUrl = "https://ted-proxy.herokuapp.com/";
  const targetUrl = url;
  return fetch(proxyUrl + targetUrl).then((res) => res.json());
}

// Hide loading spinner when ajax response is fetched:
function hideLoading() {
  const loadingContainer = document.querySelector("#loading-container");
  const currentReport = document.querySelector(".current-report");
  loadingContainer.classList.remove("display");
  currentReport.style.visibility = "visible";
  currentReport.style.opacity = 1;
}

function formatConditions(conditions) {
  return conditions.split("_").join(" ");
}

function styleTime(timestamp) {
  const time = new Date(timestamp * 1000);
  const formattedTime = time.getHours() + ":" + time.getMinutes();
  return formattedTime;
}

// Update wind direction arrow to degress on map
function updateWind(degree) {
  const windCircle = document.querySelector(".wind-circle");
  const windArrow = document.querySelector(".wind-arrow");
  const windDegree = document.querySelector(".wind-degree");

  windCircle.style.transform = "rotate(" + degree + "deg)";
  windArrow.style.transform = "rotate(" + degree + "deg)";
  windDegree.style.transform = "rotate(-" + degree + "deg)";
}

// Update swell direction arrow to degrees on map
function updateSwell(swell) {
  const degree = swell["direction"];
  const swellCircle = document.querySelector(".swell-circle");
  const swellArrow = document.querySelector(".swell-arrow");
  const swellDegree = document.querySelector(".swell-degree");

  swellCircle.style.transform = "rotate(" + degree + "deg)";
  swellArrow.style.transform = "rotate(" + degree + "deg)";
  swellDegree.style.transform = "rotate(-" + degree + "deg)";
}

function displayFutureForecast(days) {
  const upcomingDayTemplate = document.querySelector(
    "[data-upcoming-day-template]"
  );
  const upcomingDaysContainer = document.querySelector(".upcoming-days");

  upcomingDaysContainer.innerHTML = " ";
  days["data"]["conditions"].forEach((dayData, index) => {
    const daysContainer = upcomingDayTemplate.content.cloneNode(true);
    daysContainer.querySelector("[data-upcoming-date]").innerText = convertTime(
      dayData["timestamp"]
    );
    daysContainer.querySelector(
      "[data-upcoming-am-rating]"
    ).innerText = formatConditions(dayData["am"]["rating"]);
    daysContainer.querySelector("[data-am-human-relation]").innerText =
      dayData["am"]["humanRelation"];
    daysContainer.querySelector("[data-upcoming-am-min]").innerText =
      dayData["am"]["minHeight"];
    daysContainer.querySelector("[data-upcoming-am-max]").innerText =
      dayData["am"]["maxHeight"];
    daysContainer.querySelector(
      "[data-upcoming-pm-rating]"
    ).innerText = formatConditions(dayData["pm"]["rating"]);
    daysContainer.querySelector("[data-pm-human-relation]").innerText =
      dayData["pm"]["humanRelation"];
    daysContainer.querySelector("[data-upcoming-pm-min]").innerText =
      dayData["pm"]["minHeight"];
    daysContainer.querySelector("[data-upcoming-pm-max]").innerText =
      dayData["pm"]["maxHeight"];
    upcomingDaysContainer.appendChild(daysContainer);
  });
}

function convertTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toDateString();
}

function realtimeClock() {
  const time = new Date();
  let hours = time.getHours();
  let minutes = time.getMinutes();
  let seconds = time.getSeconds();

  // Pad hours, min, seconds with leading 0s:
  hours = ("0" + hours).slice(-2);
  minutes = ("0" + minutes).slice(-2);
  seconds = ("0" + seconds).slice(-2);

  // Display time:
  const timeSpot = (document.getElementById("realtime").innerHTML =
    hours + "  :  " + minutes + "  :  " + seconds);

  const t = setTimeout(realtimeClock, 500);
}

// Get spot information
function getSpot(id) {
  const spot_info = {
    "5842041f4e65fad6a7708a1a": {
      name: "Assateague Island, MD",
      about:
        "Assateague Island is a 37-mile (60 km) long barrier island located off the eastern coast of the Delmarva Peninsula facing the Atlantic Ocean. The northern two-thirds of the island is in Maryland while the southern third is in Virginia.",
      image: "assets/images/assateague-map.png",
    },
    "584204214e65fad6a7709d1b": {
      name: "Outer Banks, NC",
      about:
        "The Outer Banks are a 200-mile (320 km) string of barrier islands and spits off the coast of North Carolina and southeastern Virginia, on the east coast of the United States. They line most of the North Carolina coastline, separating Currituck Sound, Albemarle Sound, and Pamlico Sound from the Atlantic Ocean.",
      image: "assets/images/obx-map.png",
    },
    "584204214e65fad6a7709d0a": {
      name: "Rockaway Beach, NY",
      about:
        "Rockaway Beach is a neighborhood on the Rockaway Peninsula in the New York City borough of Queens. The neighborhood is bounded by Arverne to the east and Rockaway Park to the west. It is named for the Rockaway Beach and Boardwalk, which is the largest urban beach in the United States, stretching from Beach 3rd to Beach 153rd Streets on the Atlantic Ocean.",
      image: "assets/images/rockaway-map.png",
    },
  };

  return spot_info[id];
}
