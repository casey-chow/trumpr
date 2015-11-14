from collections import *
import random

def train_char_lm(fname, order=4):
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

def generate_text(lm, order, nletters=200):
    history = "~" * order
    out = []
    for i in xrange(nletters):
        c = generate_letter(lm, history, order)
        history = history[-order:] + c
        out.append(c)
    return "".join(out)

lm = train_char_lm("trumptext.txt", order=8)
print generate_text(lm, 8)

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


