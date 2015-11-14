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

def generate_text(lm, order, seed="~~~~~~~~", nletters=200):
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
f = open("trumpresults2.txt", 'a')

trumptext = g.read()


for i in range(30):
    randIndex = int(random.random() * (len(trumptext) - 100))
    start = 0
    for j in range(randIndex,len(trumptext)):
        c = trumptext[j]
        if c == '.' or c == '?' or c == '!':
            for k in range(j+1, len(trumptext)):
                if trumptext[k].isalpha() or trumptext[k] == '@':
                    start = k
                    break
            break

    inputSeed = trumptext[start:start+default_order]
    resultTweets = generate_text(lm, default_order, inputSeed)

    for j in range(len(resultTweets)-1,0,-1):
        c = resultTweets[j]
        if c == '.' or c == '?' or c == '!':
            end = j+1
            break

    print(resultTweets[:end])
    print()
    f.write(resultTweets[:end])
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


