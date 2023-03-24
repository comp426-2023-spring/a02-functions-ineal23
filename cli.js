#!/usr/bin/env node
import minimist from 'minimist';
import moment from 'moment-timezone';
import fetch from 'node-fetch';

const args = minimist(process.argv.slice(2));

if (args.h) {
  console.log(`Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE
    -h            Show this help message and exit.
    -n, -s        Latitude: N positive; S negative.
    -e, -w        Longitude: E positive; W negative.
    -z            Time zone: uses tz.guess() from moment-timezone by default.
    -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
    -j            Echo pretty JSON from open-meteo API and exit.`);
  process.exit(0);
}

const help = args.h;
const timezone = args.z ? args.z : moment.tz.guess();
const lat = args.n ? parseFloat(args.n).toFixed(2) : (args.s ? parseFloat(args.s * -1).toFixed(2) : null);
const lg = args.e ? parseFloat(args.e).toFixed(2) : (args.w ? parseFloat(args.w * -1).toFixed(2) : null);
const json = args.j;
const day = args.d ? parseInt(args.d) : 1;

const URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lg}&daily=precipitation_hours&current_weather=true&timezone=${timezone}`;

fetch(URL)
  .then(response => response.json())
  .then(data => {
    if (help) {
      console.log(help_str);
    } else if (json) {
      console.log(data);
    } else {
      weather(data);
    }
  });

function weather(data) {
  const date_log = day === 0 ? " today." : (day === 1 ? " tomorrow." : ` in ${day} days.`);
  const precip = data.daily.precipitation_hours;
  const message = precip[day] >= 1 ? "You might need your galoshes" : "You will not need your galoshes";
  console.log(`${message}${date_log}`);
}
