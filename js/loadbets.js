// Global Variables

// apiurl = "https://2foxz7t1qb.execute-api.ap-southeast-1.amazonaws.com" //Moved to config.js
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Script Starts Below
document.addEventListener('DOMContentLoaded', function() {
  // By default, load bets
  var country = "singapore";
  var starttime = "202207010000";
  var endtime = "202207212000";
  

  // Check whether user is authenticated
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser !== null) {
    document.getElementById("loginsection").innerHTML = `<span style="color:white;padding-right:10px"><b>Welcome, ${cognitoUser.username}!<b></span>  <button type="button" class="btn btn-primary" onclick="window.GameDayApp.logout()">Logout</button>`;
    document.getElementById("loginsection").hidden = false;
    load_bets(country, starttime, endtime);
  } else {
    document.getElementById("loginsection").hidden = false;
    document.getElementById("navy-blue-title-header").hidden = true;
    document.getElementById("main-content").hidden = true;
    notAuthorizedHtml = '<br><h1>Sorry! You have to be logged in to view this page. </h1>';
    document.querySelector('#banner-main').insertAdjacentHTML('afterend',notAuthorizedHtml);  
  }


  
  document.querySelectorAll('#raceentry').forEach(raceEntry => {
    raceEntry.onclick = function () {
      console.log("Success!");
    }
      //console.log(raceEntry.dataset.datetime)}
    });

  document.querySelector('#filter').addEventListener('click', () => update_search());
  });

function load_bets(country, starttime, endtime) {
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

  userPool.getCurrentUser().getSession(function(err, session) {
    console.log(session.getIdToken().getJwtToken());
    fetch(`${apiurl}/prod/listbets?country=${country}&starttime=${starttime}&endtime=${endtime}`, {
      method: 'GET', // or 'PUT'
      headers: {
          'Authorization': session.getIdToken().getJwtToken(),
      },
      })
    .then(response => response.json())
    .then(results => {
      // Print emails
      // console.log(results);
      if (Object.keys(results).length === 0) {
        console.log(results)
        raceListHeaderHtml = `<div id="racelistheader" style="font-size:16px"><b>You have not made any bets for races in ${countryStr} from ${startdate_str} to ${enddate_str}</b></div>`;
        document.querySelector('#raceresults').insertAdjacentHTML('afterend',raceListHeaderHtml); 
      } else {
        results.reverse().forEach(display_race_link);
        raceListHeaderHtml = `<div id="racelistheader" style="font-size:16px"><b>List of bets you have made for races in ${countryStr} from ${startdate_str} to ${enddate_str}</b></div>`;
        document.querySelector('#raceresults').insertAdjacentHTML('afterend',raceListHeaderHtml);  
      }
    });
  })
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

load_bets(country, starttime, endtime);
}

function load_betting_results(country, date_time) {
// Get username
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
var cognitoUser = userPool.getCurrentUser();
var username = cognitoUser.username;

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
document.getElementById("mainbody").innerHTML = `<hr><div id="results" style="font-size:16px"><b>Your betting results for ${countryStr} race on ${datestr}</b></div>`;

// API Endpoint for Getting Race Results (deprecated, use global variables)
// var url = "https://2foxz7t1qb.execute-api.ap-southeast-1.amazonaws.com"
// Fetch Betting Results
userPool.getCurrentUser().getSession(function(err, session) {
  console.log(session.getIdToken().getJwtToken());
  fetch(`${apiurl}/prod/betresults?country=${country}&racedatetime=${date_time}`, {
    method: 'GET', // or 'PUT'
    headers: {
        'Authorization': session.getIdToken().getJwtToken(),
    },
    })
  .then(response => response.json())
  .then(results => {
    // Print emails
    console.log(results[0]);
    var result = results[0];
    if (result.winnings > 0) {
      bettingResultsHtml = `<table><tr style="background-color:#0747ad; color:white"><td style="width:300px;border:none;padding-left:20px"><b>Results</b></td><td style="width:400px;border:none"><b></b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#e3e3e3"><td style="width:300px;border:none;padding-left:20px"><b>Bet Type</b></td><td style="width:400px;border:none;padding-left:10px"><b>${result.bet_type}</b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#FFFFFF"><td style="width:300px;border:none;padding-left:20px"><b>Your Bet</b></td><td style="width:400px;border:none;border:none;padding-left:13px"><b>${result.bet_value}</b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#e3e3e3"><td style="width:300px;border:none;padding-left:20px"><b>Race Result</b></td><td style="width:400px;border:none;border:none;padding-left:13px"><b>${result.result_value}</b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#FFFFFF"><td style="width:300px;border:none;padding-left:20px"><b>Bet Amount</b></td><td style="width:400px;border:none;border:none;padding-left:10px"><b>$${result.bet_amount}</b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#e3e3e3"><td style="width:300px;border:none;padding-left:20px"><b>Win Amount</b></td><td style="width:400px;border:none;color:green;border:none;padding-left:10px"><b>$${result.winnings}</b></td></tr></table>`;
    } else {
      bettingResultsHtml = `<table><tr style="background-color:#0747ad; color:white"><td style="width:300px;border:none;padding-left:20px"><b>Results</b></td><td style="width:400px;border:none"><b></b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#e3e3e3"><td style="width:300px;border:none;padding-left:20px"><b>Bet Type</b></td><td style="width:400px;border:none;border:none;padding-left:10px"><b>${result.bet_type}</b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#FFFFFF"><td style="width:300px;border:none;padding-left:20px"><b>Your Bet</b></td><td style="width:400px;border:none;border:none;padding-left:13px"><b>${result.bet_value}</b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#e3e3e3"><td style="width:300px;border:none;padding-left:20px"><b>Race Result</b></td><td style="width:400px;border:none;border:none;padding-left:13px"><b>${result.result_value}</b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#FFFFFF"><td style="width:300px;border:none;padding-left:20px"><b>Bet Amount</b></td><td style="width:400px;border:none;border:none;padding-left:10px"><b>$${result.bet_amount}</b></td></tr></table>`;
      bettingResultsHtml += `<table><tr style="background-color:#e3e3e3"><td style="width:300px;border:none;padding-left:20px"><b>Loss Amount</b></td><td style="width:400px;border:none;color:red;border:none;padding-left:10px"><b>$${result.winnings}</b></td></tr></table>`;
    }
    document.querySelector('#results').insertAdjacentHTML('afterend',bettingResultsHtml);
  });
})

//fetch(`${apiurl}/prod/raceresults?country=${country}&datetime=${date_time}`)
//.then(response => response.json())
//.then(results => {
//  results.reverse().forEach(display_result_row);
//  tableHeaderHtml = '<table><tr style="background-color:#0747ad; color:white"><td style="width:80px;border:none;padding-left:5px"><b>Rank</b></td><td style="width:200px;border:none"><b>Driver</b></td><td style="width:150px;border:none;text-align:center;"><b>Team</b></td><td style="width:80px;text-align:center;border:none"><b>Points</b></td></tr></table>';
//  document.querySelector('#results').insertAdjacentHTML('afterend',tableHeaderHtml);
//});
}

function display_race_link(contents) {
// var race_row = document.createElement('div');
// results.className = 'results';
country = contents.country;
datetime_str = String(contents.race_datetime);
year = datetime_str.substring(0,4);
month = datetime_str.substring(4,6);
day = datetime_str.substring(6,8);
datestr = `${day}/${month}/${year}`;
// race_row.innerHTML = datestr;
// race_row.setAttribute("data-id", datetime_str);
var raceHTMLString = `<button data-datetime="${datetime_str}" data-country="${country}" id="raceentry" onclick=load_betting_results(\'${country}\',\'${datetime_str}\') class="btn btn-info" style="margin: 5px">${datestr}</button>`;

// Add post to DOM
document.querySelector('#raceresults').insertAdjacentHTML('afterend',raceHTMLString);
}