import json, sys, codecs, re
from twitter import Twitter, OAuth, TwitterHTTPError
from collections import *
import random
import string

def writeTweetTextFile(screenname):
    # if len(sys.argv) > 1:
    #     screenname = sys.argv[1]
    # else:
    #     screenname = 'realDonaldTrump'
    apikey = 'QKeGwK39iGzWLSzcBPRN038vH'
    apisecret = 'WcAtHvSDY7UkBgA1o8VgSOIeDqctnhncy49VXUkasFWEFfhqjw'
    accesstoken = '624850224-yRga3n3qzgyRChfO95sDmEe9cpSlnQg75FRfQuVg'
    accesstokensecret = 'GGK6Wa6cdlGe1zxOe19zpuEr7WFolqlNtL1tDpsUth29M'

    oauth = OAuth(accesstoken, accesstokensecret, apikey, apisecret)

    twitter = Twitter(auth=oauth)
    smallestID = '992046407113732096'

    outputFile = screenname + '_text.txt'
    outfile = codecs.open(outputFile, encoding='utf-8', mode='w')

    numQueries = 19
    for i in range(numQueries):
        data = twitter.statuses.user_timeline(trim_user='true', max_id=smallestID, 
    		include_rts='false', screen_name=screenname, lang='en', count=200)
        for x in data:
            toWrite = x['text']
            smallestID = x['id']
            if toWrite[0] == '"':
                continue
            toWrite = toWrite.replace('&amp;', '&')
            toWrite = toWrite.replace('.@', '@')
            toWrite = re.sub(r'https?://t.co/\w+', '', toWrite)
            toWrite = re.sub(r'[\s]+', ' ', toWrite) + '` '
            outfile.write(toWrite)
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
    return "".join(out)

tweetSeparate = '`'
def generate_tweets(textSource, textOut, num):
    trumpTextSource = textSource
    lm = train_char_lm(trumpTextSource, order=default_order)


    g = open(trumpTextSource, 'r')
    f = open(textOut, 'a')

    trumptext = g.read()

    for i in range(num):
        randIndex = int(random.random() * (len(trumptext) - 100))
        start = 0
        for j in range(randIndex,len(trumptext)):
            c = trumptext[j]
            if c == tweetSeparate or c == '.' or c == '?' or c == '!':
                for k in range(j+1, len(trumptext)):
                    if (trumptext[k].isalpha() or trumptext[k] == '@' or trumptext[k] == '#') and trumptext[k+1] != '.':
                        start = k
                        break
                break

        inputSeed = trumptext[start:start+default_order]
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
        resultTweets = resultTweets.replace(tweetSeparate, "")
        print(resultTweets)
        print('')

        f.write(resultTweets)
        f.write("\n")
        f.write("\n")

if len(sys.argv) > 1:
    screenname = sys.argv[1]
else:
    screenname = 'realDonaldTrump'

writeTweetTextFile(screenname)
generate_tweets(screenname + '_text.txt', screenname + '_results.txt', 20)






