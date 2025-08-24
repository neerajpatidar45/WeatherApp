
const usertab = document.querySelector("[data-userweather]");
const searchtab = document.querySelector("[data-searchweather]");
const usercontainer = document.querySelector(".weather-container");
const grantaccesscontainer = document.querySelector(".grant-location-container");
const searchform = document.querySelector("[data-searchcontainer]"); // FIXED
const loadingscreen = document.querySelector(".loading-container"); // FIXED spelling
const userinfocontainer = document.querySelector(".user-info-container"); // FIXED spelling
const searchinput = document.querySelector("[data-searchinput]");
const grantaccessbutton = document.querySelector("[data-grantaccess]");
const API_key = "bc9fa2606ba21f63ae58a2a6ae15db9f";

let currenttab = usertab;
currenttab.classList.add("current-tab");

getfromsessionstorage();

function switchtab(clickestab) {
    if (clickestab !== currenttab) {
        currenttab.classList.remove("current-tab");
        currenttab = clickestab;
        currenttab.classList.add("current-tab");

        if (!searchform.classList.contains("active")) {
            userinfocontainer.classList.remove("active");
            grantaccesscontainer.classList.remove("active");
            searchform.classList.add("active");
        } else {
            searchform.classList.remove("active");
            userinfocontainer.classList.remove("active");
            getfromsessionstorage();
        }
    }
}

usertab.addEventListener("click", () => switchtab(usertab));
searchtab.addEventListener("click", () => switchtab(searchtab));

function getfromsessionstorage() {
    const localcoordinates = sessionStorage.getItem("user-coordinate");
    if (!localcoordinates) {
        grantaccesscontainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localcoordinates);
        fetchuserweatherinfo(coordinates);
    }
}

async function fetchuserweatherinfo(coordinates) {
    const { lat, lon } = coordinates;
    grantaccesscontainer.classList.remove("active");
    loadingscreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`
        );
        const data = await response.json();
        loadingscreen.classList.remove("active");
        userinfocontainer.classList.add("active");
        renderweatherinfo(data);
    } catch (err) {
        loadingscreen.classList.remove("active");
        alert("Something went wrong while fetching weather.");
    }
}

function renderweatherinfo(weatherinfo) {
    const cityname = document.querySelector("[data-cityname]");
    const countryicon = document.querySelector("[data-countryicon]");
    const desc = document.querySelector("[data-weatherdesc]");
    const weathericon = document.querySelector("[data-weathericon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudness = document.querySelector("[data-cloudness]");

    cityname.innerText = weatherinfo?.name;
    countryicon.src = `https://flagcdn.com/144x108/${weatherinfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherinfo?.weather?.[0]?.description;
    weathericon.src = `https://openweathermap.org/img/w/${weatherinfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherinfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherinfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherinfo?.main?.humidity} %`;
    cloudness.innerText = `${weatherinfo?.clouds?.all} %`;
}

function getlocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const usercoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
    sessionStorage.setItem("user-coordinate", JSON.stringify(usercoordinates));
    fetchuserweatherinfo(usercoordinates);
}

grantaccessbutton.addEventListener("click", getlocation);

searchform.addEventListener("submit", (e) => {
    e.preventDefault();
    const cityname = searchinput.value.trim();
    if (cityname === "") return;
    fetchsearchweather(cityname);
});

async function fetchsearchweather(city) {
    loadingscreen.classList.add("active");
    userinfocontainer.classList.remove("active");
    grantaccesscontainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`
        );
        const data = await response.json();

        if (data?.cod === "404") {
            loadingscreen.classList.remove("active");
            alert("City not found. Please try again.");
            return;
        }

        loadingscreen.classList.remove("active");
        userinfocontainer.classList.add("active");
        renderweatherinfo(data);
    } catch (err) {
        loadingscreen.classList.remove("active");
        alert("Failed to fetch weather data.");
    }
}




