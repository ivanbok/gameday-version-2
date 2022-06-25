// Global Variables

apiurl = "https://2foxz7t1qb.execute-api.ap-southeast-1.amazonaws.com"

// Script Starts Below
document.addEventListener('DOMContentLoaded', function() {

  // Check whether user is authenticated
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();
  console.log("Before")
  console.log(cognitoUser.username)
  console.log("After")
  if (cognitoUser !== null) {
    document.getElementById("loginsection").innerHTML = `<span style="color:white"><b>Welcome, ${cognitoUser.username}!<b></span>  <button type="button" class="btn btn-primary" onclick="window.GameDayApp.logout()">Logout</button>`;
    document.getElementById("loginsection").hidden = false;
  } else {
    document.getElementById("loginsection").hidden = false;
  }

  // By default, load results
  var country = "singapore";
  var starttime = "202206041000";
  var endtime = "202206172000";
  // load_results(country, starttime, endtime);
  load_races(country, starttime, endtime);
  
  document.querySelectorAll('#raceentry').forEach(raceEntry => {
    raceEntry.onclick = function () {
      console.log("Success!");
    }
      //console.log(raceEntry.dataset.datetime)}
    });

  document.querySelector('#filter').addEventListener('click', () => update_search());

  });

function load_races(country, starttime, endtime) {
// Generate Human Readable Country Name
var countryStr = country.charAt(0).toUpperCase() + country.slice(1);
if (country === "newzealand") {
  countryStr = "New Zealand"
}

// Change Image
document.getElementById("banner-main").innerHTML = `<img src="static/banner-${country}.jpeg" width="658px" style="overflow: auto;">`;

//// Generate Human-Readable Dates
// Perform conversion for start date
starttime_str = String(starttime);
start_year = starttime_str.substring(0,4);
start_month = starttime_str.substring(4,6);
start_day = starttime_str.substring(6,8);
startdate_str = `${start_day}/${start_month}/${start_year}`;

// Perform conversion for end date
endtime_str = String(endtime);
end_year = endtime_str.substring(0,4);
end_month = endtime_str.substring(4,6);
end_day = endtime_str.substring(6,8);
enddate_str = `${end_day}/${end_month}/${end_year}`;

// API Endpoint (Deprecated, use global variable)
// var url = "https://2foxz7t1qb.execute-api.ap-southeast-1.amazonaws.com"
// Fetch list of emails
fetch(`${apiurl}/prod/listraces?country=${country}&starttime=${starttime}&endtime=${endtime}`)
.then(response => response.json())
.then(results => {
  // Print emails
  // console.log(results);
  results.reverse().forEach(display_race_link);
  // Add header here
  raceListHeaderHtml = `<div id="racelistheader" style="font-size:16px"><b>Races in ${countryStr} from ${startdate_str} to ${enddate_str}</b></div>`;
  document.querySelector('#raceresults').insertAdjacentHTML('afterend',raceListHeaderHtml);
});
}
  
function update_search() {
document.getElementById("mainracebody").innerHTML = "<div id=\"raceresults\"></div>";
document.getElementById("mainbody").innerHTML = '<div id="results"></div>';
// document.querySelectorAll('#mainbody').innerHTML = '<div id="results"></div>';
var country = document.getElementById("country").value;

var startdatestr = document.getElementById("startdate").value;
const startdateArray = startdatestr.split("/");
var starttime = `${startdateArray[2]}${startdateArray[1]}${startdateArray[0]}0000`

var enddatestr = document.getElementById("enddate").value;
const enddateArray = enddatestr.split("/");
var endtime = `${enddateArray[2]}${enddateArray[1]}${enddateArray[0]}2359`

load_races(country, starttime, endtime);
}

function load_results(country, date_time) {
// Generate Human-Readable Date
datetime_str = String(date_time);
year = datetime_str.substring(0,4);
month = datetime_str.substring(4,6);
day = datetime_str.substring(6,8);
datestr = `${day}/${month}/${year}`;

// Capitalise first letter of the country
var countryStr = country.charAt(0).toUpperCase() + country.slice(1);
if (country === "newzealand") {
  countryStr = "New Zealand"
}

// Clear existing content and generate headers
document.getElementById("mainbody").innerHTML = `<hr><div id="results" style="font-size:16px"><b>Results for ${countryStr} race on ${datestr}</b></div>`;

// API Endpoint for Getting Race Results (deprecated, use global variables)
// var url = "https://2foxz7t1qb.execute-api.ap-southeast-1.amazonaws.com"
// Fetch Race Results
fetch(`${apiurl}/prod/raceresults?country=${country}&datetime=${date_time}`)
.then(response => response.json())
.then(results => {
  // Print Race Results
  // console.log(results);
  results.reverse().forEach(display_result_row);
  tableHeaderHtml = '<table><tr style="background-color:#0747ad; color:white"><td style="width:80px;border:none;padding-left:5px"><b>Rank</b></td><td style="width:200px;border:none"><b>Driver</b></td><td style="width:150px;border:none;text-align:center;"><b>Team</b></td><td style="width:80px;text-align:center;border:none"><b>Points</b></td></tr></table>';
  document.querySelector('#results').insertAdjacentHTML('afterend',tableHeaderHtml);
});
}

function display_race_link(contents) {
// var race_row = document.createElement('div');
// results.className = 'results';
country = contents.country;
datetime_str = String(contents.datetime);
year = datetime_str.substring(0,4);
month = datetime_str.substring(4,6);
day = datetime_str.substring(6,8);
datestr = `${day}/${month}/${year}`;
// race_row.innerHTML = datestr;
// race_row.setAttribute("data-id", datetime_str);
var raceHTMLString = `<button data-datetime="${datetime_str}" data-country="${country}" id="raceentry" onclick=load_results(\'${country}\',\'${datetime_str}\') class="btn btn-info" style="margin: 5px">${datestr}</button>`;

// Add post to DOM
document.querySelector('#raceresults').insertAdjacentHTML('afterend',raceHTMLString);
}

function display_result_row(contents) {
var result_row = document.createElement('div');
results.className = 'results';
position = contents.position;
driver = contents.driver;
team = contents.team;
points = contents.points;
if (parseInt(position) % 2 == 0) {
  result_row.innerHTML = `<table><tr style="background-color:#FFFFFF"><td style="width:80px;border:none;padding-left:5px"><b>${position}</b></td><td style="width:200px;border:none"><b>${driver}</b></td><td style="width:150px;border:none;text-align:center;color:gray"><b>${team}</b></td><td style="width:80px;text-align:center;border:none"><b>${points}</b></td></tr></table>`;
}
else {
  result_row.innerHTML = `<table><tr style="background-color:#e3e3e3"><td style="width:80px;border:none;padding-left:5px"><b>${position}</b></td><td style="width:200px;border:none"><b>${driver}</b></td><td style="width:150px;border:none;text-align:center;color:gray"><b>${team}</b></td><td style="width:80px;text-align:center;border:none"><b>${points}</b></td></tr></table>`;
}
result_row.setAttribute("data-id", position);
var entryHTMLString = `<div data-id="${position}" id="resultrow">${result_row.innerHTML}</div>`;

// Add post to DOM
document.querySelector('#results').insertAdjacentHTML('afterend',entryHTMLString);
}