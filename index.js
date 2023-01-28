// like an import statement, needed to have access to express node package
const express = require('express');
// To create web app call express function
const app = express();
// pull fetch function from node-fetch
const fetch = require('node-fetch');
// Require this environment variable thing
require('dotenv').config();

// listen to port, callback
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening at ${port}`);
});

// server should be able to serve static web pages -> index.html
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

// Proxy server to get API data
// handles GET request | GET method route
app.get('/api', async (request, response) => {

  // ---------------------------------------------------------------------
  // getting a spotify access token
  async function getToken() {

    // get the credentials out of the .env file
    const client_id = process.env.CLT_ID;
    const client_secret = process.env.CLT_SEC;

    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Authorization' : 'Basic ' + btoa( client_id + ':' + client_secret )
      },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
  }

  const userAccessToken = await getToken();

  // do something with the token now
  async function getTracks( token ){
    const playlist_id = '13REVO8Q6DbIqQVL9brrkA';

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log( "Got playlist data from Spotify");
    return data;
  };

  // execute function to get all the playlist tracks
  const tracks = await getTracks(userAccessToken);

  // get playlist length to loop through the tracks
  const playlistlength = Object.keys( tracks.items ).length;

  // loop through the playlist tracks to get the audio features of each track
  let songsList = [];
  for (let i = 0; i < playlistlength; i++ ){

    // get audio features for track [i]
    async function getDetails( token ){
      const track_id = tracks.items[i].track.id;

      const response = await fetch(`https://api.spotify.com/v1/audio-features/${track_id}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const details = await response.json();
      return details;
    };

    const detailsdata = await getDetails(userAccessToken);

    songsList.push( detailsdata );
  }

  // array to json object
  const songdetails = { "songs" : songsList };
  // combining both json objecs (playlist data and audio features for each song)
  const allthedata = {
    ...tracks,
    ...songdetails
  };

  // end live function
  // ---------------------------------------------------------------------

  async function getTestData(){
    const response = await fetch('http://localhost:3000/devdata.json', {
      method: "GET"
    });
    const data = await response.json();
    console.log( "Got data locally." );
    return data;
  };

  // const testdata = await getTestData();
  // response.json( testdata );

  // give client the data as response
  response.json( allthedata );

});
