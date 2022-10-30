const arguments = process.argv.slice(2);
// check if file path was given in command line arguments
if (arguments.length <= 0) {
  return console.error("Please provide a file path to read IPs from");
}

const path = arguments[0];
const fs = require("fs");
const axios = require("axios");
// check if file exists at that path
fs.access(path, (err) => {
  if (err) {
    return console.error(`Could not access file at ${path}`, err);
  }
  // file exists
  fs.readFile(path, async (err, data) => {
    if (err) {
      return console.error(`Could not read file at ${path}`, err);
    }
    // file read successfully.
    const IPs = data
      ?.toString()
      ?.split("\n")
      .filter((ip) => !!ip);
    console.log(IPs);
    const URLs = makeURLsFromIps(IPs);
    const responses = await Promise.all(URLs?.map((url) => axios.get(url)));
    const requiredData = transformIpApiResponses(responses);
    console.log(requiredData, requiredData.length);
  });
});

// later we can write separate pluggable functions like this
// to make request URLs for some other location provider
const makeURLsFromIps = (ips) => {
  return ips?.map((ip) => `https://ipapi.co/${ip}/json`);
};

// another pluggable function to validate API response
const isValidIpApiResponse = (response) => {
  return response?.error !== true;
};

// another pluggable function to transfor responses in required structure.
const transformIpApiResponses = (responses) => {
  const validResponses = responses
    ?.map((response) => response?.data)
    ?.filter(isValidIpApiResponse);
  return validResponses?.map(
    ({
      ip,
      city,
      region,
      country_name,
      country_code,
      latitude,
      longitude,
      postal,
      timezone,
      utc_offset,
      region_code,
    }) => ({
      ip,
      city,
      region,
      countryName: country_name,
      countryCode: country_code,
      latitude,
      longitude,
      postal,
      timezone,
      utcOffset: utc_offset,
      regionCode: region_code,
    })
  );
};
