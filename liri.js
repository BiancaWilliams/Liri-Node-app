require("dotenv").config();

//apps
var Spotify = require('node-spotify-api');
var request = require("request");
var Twitter = require('twitter');
var fs = require("fs");

// API Spotify and Twitter keys
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

// process terminal arguments
var dataEntry = process.argv;
var action = process.argv[2];

// string for song name data process
var title = ""
if (process.argv[3] !== undefined) {
    for (i = 3; i < dataEntry.length; i++) {
        title += dataEntry[i] + " ";
    };
};

// case and breaks
switch (action) {
    case "movie-this":
        movie();
        break;

    case "spotify-this-song":
        spotifyTitle();
        break;

//this case will display up to last 20 tweets in terminal
    case "my-tweets":
        tweets();
        break;

    case "do-what-it-says":
        doIt();
        break;

    default:
        var logAuto = "----- NO ENTRY -------------------------\nNot Recognized!----------------------\n";
        console.log(logAuto);
        fs.appendFile("log.txt", logAuto, function (err) {
            if (err) {
                return console.log(err);
            };
        });
};

// Movie Input If title of movie not present
function movie() {
    if (process.argv[3] === undefined) {
        title = "Mr.+Nobody";
        movieInfo();
    } else if (title !== undefined) {
        titleSplit = title.split(" ");
        title = titleSplit.join("+");
        movieInfo();
    };
};

// contact OMDBapi for movie info
function movieInfo() {
    var queryURL ="http://www.omdbapi.com/?t=" + "Mr.+Nobody" + "&y=&plot=short&apikey=trilogy";

    request(queryURL, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            if (body) {
                var data = JSON.parse(body);
                if (data.Error == 'Nothing listed for this movie!') {
                    var noListingMov = "\n---------------------------------- MOVIE THIS -----------------------\n No movies found.\n-------------------\n";
                    console.log(noListingMov);
                    fs.appendFile("log.txt", noListingMov, function (err) {
                        if (err) {
                            return console.log("No movie by that title data did not append to log.txt file.");
                        };
                    });
                } else if (data.Ratings.length < 2) {
                    var logMovies = "\n--------------------------- MOVIE THIS ------------------------\nTitle: " + data.Title +
                        "\nRelease Year: " + data.Year +
                        "\nIMDB Rating: " + data.imdbRating +
                        "\nRotten Tomatoes Rating: No Rotten Tomatoes Rating\nCountry movie produced in: " + data.Country +
                        "\nLanguage: " + data.Language +
                        "\nPlot: " + data.Plot +
                        "\nActors: " + data.Actors + "\n-------------------------------------------------\n";
                    console.log(logMovies);
                    fs.appendFile("log.txt", logMovies, function (err) {
                        if (err) {
                            return console.log("Movie data did not append to log.txt file.");
                        };
                    });
                    return
                } else if (data.Ratings[1].Value !== undefined) {
                    var logMovies =
                        "\n---------------------------------- MOVIE THIS ----------------------------------\nTitle: " + data.Title +
                        "\nRelease Year: " + data.Year +
                        "\nIMDB Rating: " + data.imdbRating +
                        "\nRotten Tomatoes Rating: " + data.Ratings[1].Value +
                        "\nCountry movie produced in: " + data.Country +
                        "\nLanguage: " + data.Language + "\nPlot: " + data.Plot +
                        "\nActors: " + data.Actors + "\n-------------------------------------------------------------\n";
                    console.log(logMovies);
                    fs.appendFile("log.txt", logMovies, function (err) {
                        if (err) {
                            return console.log("Movie data did not append to log.txt file.");
                        };
                    });
                };
            };
        };
        if (error) {
            var logMovieErr = "OMDBapi response error. Please try again.\n"
            console.log(logMovieErr)
            fs.appendFile("log.txt", logMovieErr, function (err) {
                if (err) {
                    return console.log("OMDBapi response error message did not append to log.txt file.");
                };
            });
        };

    });
}

// ----------------------------- Spotify -------------------------
// What to do if no title entered or if title splits into spotify syntax
function spotifyTitle() {
    if (process.argv[3] === undefined) {
        title = "The%20Sign%20Ace%20of%20Base";
        spotifyInfo();
    } else if (title !== undefined) {
        titleSplit = title.split(" ");
        title = titleSplit.join("%20");
        spotifyInfo();
    };
};

// Spotify api call and return info
function spotifyInfo() {
    spotify.search({
        type: 'track',
        query: title,
        limit: 1,
    }, function (err, data) {
        if (data) {
            var info = data.tracks.items
            var logSpotify =
                "\n------------------------------ SPOTIFY THIS SONG ----------------------\nArtist: " + info[0].artists[0].name +
                "\nSong title: " + info[0].name +
                "\nAlbum name: " + info[0].album.name +
                "\nURL Preview: " + info[0].preview_url +
                "\n-----------------------------------------------\n";
            console.log(logSpotify)
            fs.appendFile("log.txt", logSpotify, function (err) {
                if (err) {
                    return console.log("Spotify song data was not appended to the log.txt file.");
                };
            });
        } else if (err) {
            var listingNosec =
                "\n------------------------------ SPOTIFY THIS SONG ----------------------\n";
            console.log(listingNosec);
            fs.appendFile("log.txt", listingNosec, function (err) {
                if (err) {
                    return console.log("No Spotify info found.");
                };
            });
        };
    });
};

// Call to Twitter API
function tweets() {

    var limits = {
        screen_name: 'Gve_Hearts',
        count: 20
    };
    client.get('statuses/user_timeline', limits, function (error, tweets, response) {
        if (!error) {
            var logTweetHeader = ("\n---------------------------------- MY TWEETS -----------------------------------");
            console.log(logTweetHeader)
            fs.appendFile("log.txt", logTweetHeader + "\n", function (err) {
                if (err) {
                    return console.log("Twitter header was not appended to the log.txt file.");
                }
            });
            for (i = 0; i < tweets.length; i++) {
                var logTweets = i + 1 + ". Tweet: " + tweets[i].text + "\n    Created: " + tweets[i].created_at;
                console.log(logTweets);
                // append tweets to log.txt file
                fs.appendFile("log.txt", logTweets + "\n---------------------------\n", function (err) {
                    if (err) {
                        return console.log("Tweets were not appended");
                    };
                });
                console.log("--------------------------------");
            };
        };
    });
};

// ----------------------- Do-What-It-Says --------------------------
function doIt() {
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) {
            var logDoIt = ("\n--- Do-What-It-Says---\nThere was a problem reading the random.txt file. Please try again.\n------------------------");
            return console.log(logDoIt);
            fs.appendFile("log.txt", logDoIt, function (err) {
                if (err) {
                    return console.log("do-what-it-says data was not appended to the log.txt file.");
                };
            });
        };

        var output = data.split(",");
        action = output[0];
        process.argv[3] = output[1];
        title = process.argv[3];

        if (action === 'spotify-this-song') {
            spotifyTitle();
        };
    });
};function doIt() {
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) {
            var logDoIt = ("\n----------------------- Do-What-It-Says -------------------------\n Not Recognized \n File Read error ----------------------------------");
            return console.log(logDoIt);
            fs.appendFile("log.txt", logDoIt, function (err) {
                if (err) {
                    return console.log("do-what-it-says data was not appended.");
                };
            });
        };

        var output = data.split(",");
        action = output[0];
        process.argv[3] = output[1];
        title = process.argv[3];

        if (action === 'spotify-this-song') {
            spotifyTitle();
        };
    });
};

