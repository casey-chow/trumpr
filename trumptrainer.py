from collections import *
import random
import string

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

def generate_text(lm, order, seed="~~~~~~~~", nletters=200):
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
    f = open(textOut, 'w')

    trumptext = g.read()

    for i in range(num):
        randIndex = int(random.random() * (len(trumptext) - 100))
        start = 0
        for j in range(randIndex,len(trumptext)):
            c = trumptext[j]
            if c == tweetSeparate:
                for k in range(j+1, len(trumptext)):
                    if (trumptext[k].isalpha() or trumptext[k] == '@') and trumptext[k+1] != '.':
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

        print(resultTweets[:end])
        print('')
        f.write(resultTweets[:end])
        f.write("\n")
        f.write("\n")


generate_tweets("trumpText3.txt", "trumpresults3.txt", 20)

