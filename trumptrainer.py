from collections import *
import random
import string

default_order = 8

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

def generate_text(lm, order, seed="~~~~~~~~", nletters=250):
    history = seed
    # for i in range(order):
    #     history += random.choice(string.letters) * order
    out = [seed]
    for i in xrange(nletters):
        c = generate_letter(lm, history, order)
        history = history[-order:] + c
        out.append(c)
    return "".join(out)

trumpTextSource = "trumpText2.txt"
lm = train_char_lm(trumpTextSource, order=default_order)


g = open(trumpTextSource, 'r')
f = open("trumpresults.txt", 'a')

trumptext = g.read()


for i in range(1):
    randIndex = int(random.random() * (len(trumptext) - default_order))
    inputSeed = trumptext[randIndex:randIndex+default_order]
    resultTweets = generate_text(lm, default_order, inputSeed[:default_order])

    start = 0
    end = len(resultTweets)
    for i in range(len(resultTweets)):
        if resultTweets[i] == ' ':
            start = i+1
            break
    for i in range(len(resultTweets)-1,0,-1):
        if resultTweets[i] == ' ':
            end = i
            break

    print(resultTweets[start:end])
    f.write(resultTweets[start:end])
    f.write("\n")
    f.write("\n")

# seed = 'hel'
# counter = 0
# while(counter < 100):
#     rand = random.uniform(0,1)
#     probCounter = 0
    
#     for char, prob in train_char_lm("trumptext.txt"):
#         if (rand < probCounter and rand + prob > probCounter):
#             seed = seed + char
#             break
#         else:
#             probCounter += prob
#     counter += 1
# print(seed)


