import express from "express";
import { PORT } from "./config.js";
import {promises as fs} from "fs";
import cors from "cors";


function urlToOpening(url) {
    if (url) {
        const removed = url.replace("https://www.chess.com/openings/", "")
        return removed.replace("-", " ");
    }
    return "Opening name not found";
}

function processDate(date) {
    const splitted = date.split("-");
    return [parseInt(splitted[0]), parseInt(splitted[1])];
}

function calculatePerformance(rating, res) {
    switch (res) {
        case 1:
            return rating + 400;
        case 0:
            return rating - 400;
        default:
            return rating;
    }
}

class Game {
    constructor(pgn, eco, openingName, firstPlayer, secondPlayer, color, result, rating) {
        this.pgn = pgn;
        this.eco = eco;
        this.color = color;
        this.result = result;
        this.openingName = openingName;
        this.firstPlayer = firstPlayer;
        this.secondPlayer = secondPlayer;
        this.rating = rating;
    }
}

const app = express();

app.use(express.json());
app.use(cors());

app.get("/:username/:startDate/:endDate", async (request, response) => {
    // put in a try catch to see if the username even exists or if the username is already in database
    const username = request.params.username;
    const startDate = processDate(request.params.startDate);
    const endDate = processDate(request.params.endDate);

    const data = await fs.readFile('./eco.json', 'utf-8');
    const ecoMap = JSON.parse(data);
    
    try {
        // in the next 3 lines we want to add games to the previous games
        let games = [];
        for (let i = startDate[0]; i <= endDate[0]; i++) {
            for (let j = startDate[1]; j <= endDate[1]; j++) {
                const month = j < 10 ? "0" + j.toString() : j.toString();
                const resp = await fetch(`https://api.chess.com/pub/player/${username}/games/${i}/${month}`);
                const data = await resp.json();
                games = games.concat(data.games);
                //console.log(data);
                //const g = data.games;
                //console.log(g);
                // g.forEach(element => {
                //     games.push(element);
                // });

                //console.log(typeof(data));
                //games = games.concat(data);
            }
        }
        
                //const resp = await fetch(`https://api.chess.com/pub/player/${username}/games/2024/06`);
        //const data = await resp.json();
        //const games = data.games;
        
        const gamesArr = games.map((game) => {
            
            if (game.initial_setup === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' && game.rules === 'chess') {
                const color = game.white.username.toLowerCase() === username.toLowerCase() ? "white" : "black";
                const resultMatch = game.pgn.match(/\[Result "([0-1/2\-]+)"\]/);
                const result = resultMatch ? resultMatch[1] : null;
                const r = result.length > 3 ? 0.5 : (color === 'white' ? parseInt(result.charAt(0)) : parseInt(result.charAt(2)));
                const ecoCodeMatch = game.pgn.match(/\[ECO "([A-Z][0-9]{2})"\]/);
                const ecoCode = ecoCodeMatch ? ecoCodeMatch[1] : null;
                const ecoUrlMatch = game.pgn.match(/\[ECOUrl "([^"]+)"\]/);
                const ecoUrl = ecoUrlMatch ? ecoUrlMatch[1] : null;
                const rating = color === "white" ? game.black.rating : game.white.rating;
                
                return new Game(game.pgn, ecoCode, urlToOpening(ecoUrl), game.white.username, game.black.username, color, r, rating);
            }
        });
    

        const sortedGames = gamesArr.reduce((groups, item) => {
            if (item && item.color) {  // Check if item is defined and has a color property
                const color = item.color;
                if (!groups[color]) {
                  groups[color] = [];
                }
                groups[color].push(item);
              }
              return groups;
          }, {});

        const whiteGames = sortedGames["white"];
        const blackGames = sortedGames["black"];
        
        const whiteEco = whiteGames.reduce((groups, item) => {
            if (item && item.eco) {  // Check if item is defined and has a color property
                const eco = item.eco;
                if (!groups[eco]) {
                    console.log(eco);
                    console.log(ecoMap[eco]);
                    groups[eco] = {
                        "win": 0,
                        "loss": 0,
                        "draw": 0,
                        "games": [],
                        "average": 0,
                        "performance": 0,
                        "name": ecoMap[eco]
                    }
                }
                groups[eco]["games"].push(item);
                
                const result = item.result;
                if (result === 1) {
                    groups[eco]["win"]++;
                } else if (result === 0) {
                    groups[eco]["loss"]++;
                } else {
                    groups[eco]["draw"]++;
                }
                // add to black eco if works
                groups[eco]["average"] += item.rating;
                groups[eco]["performance"] += calculatePerformance(item.rating, result)
                
            }
              return groups;
          }, {});

          const blackEco = blackGames.reduce((groups, item) => {
            if (item && item.eco) {  // Check if item is defined and has a color property
                const eco = item.eco;
                if (!groups[eco]) {
                    groups[eco] = {
                        "win": 0,
                        "loss": 0,
                        "draw": 0,
                        "games": [],
                        "average": 0,
                        "performance": 0,
                        "name": ecoMap[eco]
                    }
                }
                groups[eco]["games"].push(item);
                
                    
                    const result = item.result;
                    if (result === 1) {
                        groups[eco]["win"] += 1;
                    } else if (result === 0) {
                        groups[eco]["loss"] += 1;
                    } else {
                        groups[eco]["draw"]+= 1;
                    }
                    groups[eco]["average"] += item.rating;
                groups[eco]["performance"] += calculatePerformance(item.rating, result);
                    
            }
            return groups;
          }, {});

        return response.status(200).json({whiteEco, blackEco});
    } catch (error) {
        console.log(error);
        response.status(500).send({message: error.message});
    } 
});

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log("Listening on port 5000");
})