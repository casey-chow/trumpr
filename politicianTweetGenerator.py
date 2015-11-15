import json, sys, codecs, re
from twitter import Twitter, OAuth, TwitterHTTPError
from collections import *
import random
import string
import os.path

def writeTweetTextFile(screenname, latestID = '102046407113732096'):
    # if len(sys.argv) > 1:
    #     screenname = sys.argv[1]
    # else:
    #     screenname = 'realDonaldTrump'

    # apikey = 'QKeGwK39iGzWLSzcBPRN038vH'
    # apisecret = 'WcAtHvSDY7UkBgA1o8VgSOIeDqctnhncy49VXUkasFWEFfhqjw'
    # accesstoken = '624850224-yRga3n3qzgyRChfO95sDmEe9cpSlnQg75FRfQuVg'
    # accesstokensecret = 'GGK6Wa6cdlGe1zxOe19zpuEr7WFolqlNtL1tDpsUth29M'

    accesstoken = '3843303509-g3iFsHNxjVUfWml1wkPwwrvAuxzLhV5BZezLFzR'
    accesstokensecret = 'iCh01KDauwYMj4mYfqOIIvWQFafNRGJz6AhXC9zM9daA5'
    apikey = 'FRkxZ28y55sbr8oScY6qNsVeQ'
    apisecret = 'NmGUxz5NJAIT3lx4X4T5G0cLkr7MwYgoHkuZ52Np3vYZNz51m7'

    oauth = OAuth(accesstoken, accesstokensecret, apikey, apisecret)

    twitter = Twitter(auth=oauth)
    smallestID = '1992046407113732096'
    newLatestID = 0

    outputFile = 'TweetSources/' + screenname + '_text.txt'
    outfile = codecs.open(outputFile, encoding='utf-8', mode='a')

    numQueries = 19
    firstLine = ""
    for i in range(numQueries):
        data = twitter.statuses.user_timeline(trim_user='true', since_id=latestID, max_id=smallestID, 
    		include_rts='false', screen_name=screenname, lang='en', count=200)
        if len(data) == 0:
            break
        for x in data:
            toWrite = x['text']
            smallestID = x['id']-1
            if toWrite[0] == '"':
                continue
            toWrite = toWrite.replace('&amp;', '&')
            toWrite = toWrite.replace('.@', '@')
            toWrite = re.sub(r'https?://t.co/\w+', '', toWrite)
            toWrite = re.sub(r'[\s]+', ' ', toWrite) + '`'

            if (newLatestID == 0):
                firstLine = toWrite
                newLatestID = smallestID + 1
                outfile.write(str(newLatestID))
                outfile.write('\n')

            outfile.write(toWrite)
    outfile.write(firstLine)
    outfile.close()

def writeUserFile(screenname):
     # apikey = 'QKeGwK39iGzWLSzcBPRN038vH'
    # apisecret = 'WcAtHvSDY7UkBgA1o8VgSOIeDqctnhncy49VXUkasFWEFfhqjw'
    # accesstoken = '624850224-yRga3n3qzgyRChfO95sDmEe9cpSlnQg75FRfQuVg'
    # accesstokensecret = 'GGK6Wa6cdlGe1zxOe19zpuEr7WFolqlNtL1tDpsUth29M'

    accesstoken = '3843303509-g3iFsHNxjVUfWml1wkPwwrvAuxzLhV5BZezLFzR'
    accesstokensecret = 'iCh01KDauwYMj4mYfqOIIvWQFafNRGJz6AhXC9zM9daA5'
    apikey = 'FRkxZ28y55sbr8oScY6qNsVeQ'
    apisecret = 'NmGUxz5NJAIT3lx4X4T5G0cLkr7MwYgoHkuZ52Np3vYZNz51m7'

    oauth = OAuth(accesstoken, accesstokensecret, apikey, apisecret)

    twitter = Twitter(auth=oauth)
    smallestID = '1992046407113732096'
    newLatestID = 0

    outputFile = 'TweetSources/' + screenname + '_info.txt'
    outfile = codecs.open(outputFile, encoding='utf-8', mode='a')
        #https://api.twitter.com/1.1/users/search.json?q=realDonaldTrump&count=1
    data = twitter.users.search(q=screenname, count=1)
    for x in data:
        #print(x)
        name = x['name']
        screen = x['screen_name']
        profile = x['profile_image_url']
        
        outfile.write(name)
        outfile.write('\n')
        outfile.write(screen)
        outfile.write('\n')
        outfile.write(profile)

        print(name)
        print(screen)
        print(profile)
    outfile.close()


default_order = 9

def train_char_lm(fname, order=default_order):
    data = file(fname).read()
    lm = defaultdict(Counter)
    pad = "~" * order
    data = pad + data
    for i in xrange(len(data)-order):
        history, char = data[i:i+order], data[i+order]
        lm[history][char]+=1
    def normalize(counter):
        s = float(sum(counter.values()))
        return [(c,cnt/s) for c,cnt in counter.iteritems()]
    outlm = {hist:normalize(chars) for hist, chars in lm.iteritems()}
    return outlm

def generate_letter(lm, history, order):
        history = history[-order:]
        dist = lm[history]
        x = random.random()
        for c,v in dist:
            x = x - v
            if x <= 0: return c

def generate_text(lm, order, seed, nletters=200):
    history = seed
    out = [seed]
    for i in xrange(nletters):
        c = generate_letter(lm, history, order)
        history = history[-order:] + c
        out.append(c)
        # print(c),
    return "".join(out)

tweetSeparate = '`'
def generate_tweets(textSource, textOut, num):
    trumpTextSource = textSource
    lm = train_char_lm(trumpTextSource, order=default_order)


    g = open(trumpTextSource, 'r')
    f = open(textOut, 'a')

    trumptext = g.read()

    for i in range(num):
        resultTweets = ""
        while (len(resultTweets) < 10):
            randIndex = int(random.random() * (len(trumptext) - 500))
            start = 0
            for j in range(randIndex,len(trumptext)):
                c = trumptext[j]
                if c == tweetSeparate or c == '.' or c == '?' or c == '!':
                    # print(trumptext[j:j+5])
                    for k in range(j+1, len(trumptext)-300):
                        # print(trumptext[k])
                        if (trumptext[k].isalpha() or trumptext[k] == '@' or trumptext[k] == '#') and trumptext[k+1] != '.':
                            start = k
                            # print(start)
                            break
                    break

            inputSeed = trumptext[start:start+default_order]
            # print(inputSeed)
            resultTweets = generate_text(lm, default_order, inputSeed)

            for j in range(len(resultTweets)-1,0,-1):
                c = resultTweets[j]
                if c == tweetSeparate:
                    end = j
                    break
                if c == '.' or c == '?' or c == '!' or c == '"':
                    for k in range(j-1, 0, -1):
                        if trumptext[k].isalpha():
                            end = k+2
                            break

            resultTweets = resultTweets[:end]
            resultTweets = resultTweets.replace(tweetSeparate, " ")
        print(resultTweets)

        f.write(resultTweets)
        f.write("\n")
        f.write("\n")

def runner(n, screenname):
    sourceFile = 'TweetSources/' + screenname + '_text.txt'
    outTweetFile = 'TweetResults/' + screenname + '_results.txt'
    userFile = 'TweetSources/' + screenname + '_info.txt'

    if(not os.path.isfile(userFile)):
        writeUserFile(screenname)
    else:
        f = open(userFile, 'r')
        print(f.read())

    if(not os.path.isfile(sourceFile)):
        writeTweetTextFile(screenname)
        
    else:
        h = open(sourceFile, 'r')
        latestID = h.readline()
        writeTweetTextFile(screenname, latestID)


    generate_tweets(sourceFile, outTweetFile, n)


if len(sys.argv) > 2:
    screenname = sys.argv[2]
else:
    screenname = 'realDonaldTrump'

runner(int(sys.argv[1]), screenname)









