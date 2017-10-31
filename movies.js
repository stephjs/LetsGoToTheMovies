const fs = require('fs');
const request = require('request');
var cheerio = require('cheerio');
var movie ="";

switch (process.argv[2]) {
    case "get":
        for (let i=3; i<process.argv.length; i++) {
			if (i>=4) {
				movie += "_"+process.argv[i];
			} else {
				movie += process.argv[i];
			}
			getMovieInfo(movie);
		}
        break;
    case "popular":
    	getBoxOfficeMovies('http://www.imdb.com/chart/moviemeter', getAllMoviesInfo);
    	break;
	case "boxoffice":
		getBoxOfficeMovies('http://www.imdb.com/chart/boxoffice', getAllMoviesInfo);
		break;
    default:
    	console.log("===============================");
    	console.log("Available commands: ");
    	console.log("node movies.js get [insertYourMovieTitle]");
    	console.log("node movies.js popular");
    	console.log("node movies.js boxoffice");
    	console.log("===============================");
}

const newmoviearray = [];
const updatemovies = [];


function getBoxOfficeMovies(link, callback) {
	request(link, function (error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);
			$('td.titleColumn a').each(function(i, element){
				var a = $(this).text();
				var nospaces = a.replace(/ /g,"_");
				var formated = nospaces.replace(/(?!\w|\s)./g, '');
				newmoviearray.push(formated);
			});
			callback(newmoviearray, getMovieInfo);
		}
	});
}
var counter = 0;
function getAllMoviesInfo(movieArray, callback) {
	for (let i=0; i<movieArray.length; i++) {
		callback(movieArray[i]);
	}
}

function getMovieInfo(movieName) {
	request('https://www.rottentomatoes.com/m/'+movieName, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			const startofScript = '<script type="application/ld+json" id="jsonLdSchema">';
			const scriptStarts = body.indexOf(startofScript);
			const newCut = body.substring(scriptStarts, body.length);
			const thescript = newCut.indexOf('</script>');
			const fullJSON = JSON.parse(body.substring( (scriptStarts+startofScript.length), (thescript+scriptStarts)));
			//console.log(fullJSON);
			console.log("Movie: "+fullJSON.name);
			if (fullJSON.contentRating) {
				console.log("Rating: "+fullJSON.contentRating);
			}
			if (fullJSON.aggregateRating) {
				var rating = (fullJSON.aggregateRating)["ratingValue"];
				console.log("Tomatometer: "+rating);
				var stephscore = "";
				if (parseInt(rating) >= 80) {
					stephscore = "Yes!";
				} else {
					stephscore = "Nah";
				}
				console.log("Would Steph See This Movie: "+stephscore);
			}
			let actors = "Actors: "
			for (let i=0; i<5; i++) {
				if (fullJSON.actors[i]) {
					if (i == 4) {
						actors += fullJSON.actors[i].name;
					} else {
						actors += fullJSON.actors[i].name+", "
					}
				}
			}
			console.log(actors);
			if (fullJSON.director[0]) {
				console.log("Director: "+fullJSON.director[0].name);
			}
			console.log("=========================");
		} else {
			updatemovies.push(movieName+"_2017");
			
		}
		counter++;
		if (counter == newmoviearray.length) {
			getAllMoviesInfo(updatemovies, getMovieInfo);
		}
	});
}