var fs = require('fs');
var Twit = require('twit');
var path = require('path');
var T = new Twit({
    consumer_key: 'FRkxZ28y55sbr8oScY6qNsVeQ',
    consumer_secret: 'NmGUxz5NJAIT3lx4X4T5G0cLkr7MwYgoHkuZ52Np3vYZNz51m7',
    access_token: '3843303509-g3iFsHNxjVUfWml1wkPwwrvAuxzLhV5BZezLFzR', 
    access_token_secret: 'iCh01KDauwYMj4mYfqOIIvWQFafNRGJz6AhXC9zM9daA5'
})

function writeTweetTextFile(screenname) {
    var latestID = '102046407113732096';
    if (arguments[1]) {
        latestID = arguments[1];
    }
    var smallestID = '1992046407113732096'    
    var newLatestID = 0
    var outputFile = path.join(__dirname, 'TweetSources/'+screenname+'_text.txt');
    var outfile = fs.createWriteStream(outputFile, {encoding: "utf8" })
    var numQueries = 19;
    var firstLine = '';
    for (var i = 0; i < numQueries; i++) {
        var data = T.get('statuses/user_timeline', {trim_user: 'true', since_id: latestID, max_id: smallestID, include_rts: 'false', screen_name: screenname, lang: 'en', count: 200});
        if (data.length == 0) {
            break;
        }
        data.forEach(function(x, index, arr) {
            var toWrite = x['text'];
            smallestID = x[id]-1;
            if (toWrite.substring(0,1) == '"') {
                continue;
            }
            toWrite = toWrite.replace('&amp;', '&');
            toWrite = toWrite.replace('.@', '@');
            var re = new RegExp('https:?://t.co/\w+', 'g');
            var reb = new RegExp('[\s]+', 'g');
            toWrite = toWrite.replace(re, '');
            toWrite = toWrite.replace(reb, '') + '`';
            if (newLatestID == 0) {
                firstLine = toWrite
                newLatestID = smallestID + 1
                outfile.write(newLatestID)
                outfile.write('\n')
            }
            outfile.write(toWrite)
        })
    }
    outfile.write(firstLine);
    outfile.close();
}

function writeUserFile(screenname) {
    var smallestID = '1992046407113732096'
    var newLatestID = 0
    var outputFile = path.join(__dirname, 'TweetSources/'+screenname+'_info.txt');
    var outfile = fs.createWriteStream(outputFile, {encoding: "utf8" });
    var data = T.get('users/search', {q: screenname, count: '1'});
    data.forEach(x) {
        var name = x['name'];
        var screen = x['screen_name'];
        var profile = x['profile_image_url'];
        outfile.write(name);
        outfile.write('\n');
        outfile.write(screen);
        outfile.write('\n');
        outfile.write(profile);
        console.log(name);
        console.log(screen);
        console.log(profile);
    }
    outfile.close();
}

var default_order = 9;

function train_char_lm(fname) {
    if (arguments.length > 1) {
        var order = arguments[1];
    }
    else {
        var order = default_order;
    }
    var lm = {};
    var data = fs.readFileSync(fname);
    var pad = "*".repeat(order);
    data = pad + data;
    for (var i = 0; i < data.length-order; i++) {
        var history = data.substring(i, i+order);
        var char = data.charAt(i+order);
        if (!lm.hasOwnProperty(history)) {
            lm[history] = {};
        }
        if(!lm[history].hasOwnProperty(char)) {
            lm[history][char] = 1;
        }
        else {
            lm[history][char] += 1;
        }
    }
    function normalize(lm) {
        var orderstrs = lm.keys();
        var sum = 0.0;
        for (var i = 0; i < orderstrs.length; i++) {
            var chars = lm[orderstrs[i]].keys();
            for (var j = 0; j < chars.length; j++) {
                sum += lm[orderstrs[i]][chars[j]];
            }
        }
        for (var i = 0; i < orderstrs.length; i++) {
            var chars = lm[orderstrs[i]].keys();
            for (var j = 0; j < chars.length; j++) {
                lm[orderstrs[i]][chars[j]] /= sum;
            }
        }
        return lm;
    }
    return normalize(lm);
}

function generate_letter(lm, history, order) {
    history = history.substring(history.length-order);
    var dist = lm[history];
    var x = Math.random();
    var keys = dist.keys();
    for (var i = 0; i < keys.length; i++) {
        x -= dist[keys[i]];
        if (x <= 0) {
            return keys[i];
        }
    }
    return keys[keys.length-1];
}

function generate_text(lm, order, seed) { // 4th arg: nletters=200
    var nletters = 200;
    if (arguments.length > 3) {
        nletters = arguments[3];
    }
    var history = seed;
    var out = history +'';
    for (var i = 0; i < nletters; i++) {
        var c = generate_letter(lm, history, order);
        history = history.substring(history.length-order) + c; 
        out.append(c)
    }
    return '' + out;
    
}

tweetSeparate = '`';

function generate_tweets(textSource, textOut, num) {
    var trumpTextSource = textSource
    var lm = train_char_lm(trumpTextSource, order=default_order)
    var trumptext = fs.readFileSync(trumpTextSource);
    //var f = fs.appendFileSync(textOut, )
    for (var i = 0; i < num; i++) {
        var resultTweets = '';
        while (resultTweets.length < 10) {
            var randIndex = Math.floor(Math.random()*(trumptext.length - 500));
            var start = 0;
            for (var j = randIndex; j < trumptext.length; j++) {
                var c = trumptext.charAt(j);
                if (c == tweetSeparate || c == '.' || c == '?' || c == '!') {
                    for (var k = j+1; k < trumptext.length-300; k++) {
                        var kk = trumptext.charAt(k);
                        if ((kk.search(/\w/) > -1 || kk == '@' || kk == '#') && trumptext.charAt(k+1) != '.') {
                            start = k;
                            break;
                        }
                    }
                    break;
                }
            }
            var inputSeed = trumptext.substring(start, start+default_order);
            var resultTweets = generate_text(lm, default_order, inputSeed);
            for (var jj = resultTweets.length-1, jj >= 0; j--) {
                var cc = resultTweets.charAt(jj);
                if (cc == tweetSeparate) {
                    var end = j;
                    break;
                }
                if (cc == '.' || cc == '?' || cc == '!' || cc == '"') {
                    for (var ii = jj-1; ii >= 0; ii--) {
                        if (trumptext.charAt(ii).search(/\w/) > -1) {
                            var end = ii + 2;
                            break;
                        }
                    }
                }
            }
            resultTweets = resultTweets.substring(0, end);
            resultTweets = resultTweets.replace(tweetSeparate, ' ');
        }
        console.log(resultTweets);
        fs.appendFileSync(textOut, resultTweets);
        fs.appendFileSync(textOut, "\n\n");
    }
    
}

function runner(n, screenname) {
    var sourceFile = path.join(__dirname, 'TweetSources/'+screenname+'_text.txt');
    var outTweetFile = path.join(__dirname, 'TweetSources/'+screenname+'_results.txt');
    var userFile = path.join(__dirname, 'TweetSources/'+screenname+'_info.txt');
    var excepted = false;
    try {
        var f = fs.readFileSync(userFile);
        console.log(f);
    } catch (e) {
        writeUserFile(screenname);
    }
    try {
        var h = fs.readFileSync(sourceFile);
        var latestID = h.substring(0, h.indexOf('\n'));
    } catch (e) {
        writeTweetTextFile(screenname);
    }
    generate_tweets(sourceFile, outTweetFile, n);
}
if (process.argv.length > 3) {
    screenname = process.argv[3];
} else {
    screenname = 'realDonaldTrump'
}
runner(process.argv[2], screenname)
