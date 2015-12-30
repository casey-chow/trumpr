# trumpr

We get it. The Onion has been rehashing the same jokes over and over again, 
and local news organizations are not keeping up with the Joneses. Where 
should we best get our lousy humor from?

Naturally: politics. But the 24-hour news cycle is simply not spouting enough
craziness from the likes of Donald Trump, Ben Carson, Hillary Clinton, and 
other presidential wannabes. So we sought to find a better way. A way that 
would make Donald Trump say, ["Keep these computers out of my country!"][computers]

This application automates the spouting of political junk so that politicians 
need no longer spend time inventing and inundating the self-referential media 
circuit we call the 4th branch of government. Because what is democracy if 
not ever increasingly less human and more computerized?

---

This code was a project from [HackPrinceton Fall 2015][hp], originally built using 
[Meteor][], [React][], and [Python][] on a [Linode][] server. It has since been 
rewritten to be fully deployed on the standard Meteor stack.

This hack won the Best Domain Award (`trumpr.org`) at HackPrinceton. Thanks,
Domain.Com for believing in us! :')

[hp]: http://hackprinceton.com
[meteor]: https://www.meteor.com
[react]: http://facebook.github.io/react/
[python]: https://www.python.org
[linode]: http://linode.com
[computers]: http://www.theverge.com/2015/12/7/9869308/donald-trump-close-up-the-internet-bill-gates

## Running

First make sure you have Meteor installed.

```bash
$ curl https://install.meteor.com/ | sh
```

Then clone away. Trumpr should run with no further setup.

```bash
$ git clone https://github.com/casey-chow/trumpr.git
$ meteor
```

## Lessons Learned

This project proved interesting both to build and to see running. We originally
hacked off of two languages, Javascript and Python, and while this let us
quickly create the initial components for the app, it turned out integrating them
was quite difficult, and so on rewrite the app was consilated into Meteor's stack.

The idea of a [Markov chain][markov] came in handy here as much of the logic of this 
app comes from Markov chain computations. One thing that proved challenging was taking 
the generated text and turning them into tweets, whereas a normal Markov model 
demonstrationd isn't really constrained by format! Our solution was to use some
rudimentary indicators of sentence beginnings and ends, and to encode the ends of
tweets into the model itself. This proved useful as the generated output actually
told is where to end the tweet!

[markov]: https://en.wikipedia.org/wiki/Markov_model

Finally, we dealt a lot with the emerging (well, now very common) concept of a
[reactive user interface][reactive] in web development. At first, this was a new 
concept and so we treated it like a classical interface system--we kept trying 
to feed stuff in through transitions, etc. etc. This actually slowed us down a lot 
during the hackathon, and we had concluded at the end that the reactive 
infrastructure wasn't suited to our app. In hindsight, however, we were just
not intelligent enough (read: "we were in the process of learning") to realize
how to work with the system. Upon rewrite, the reactive system actually proved
incredibly conducive to productivity, shaving literally hours on debugging
data flow.

[reactive]: https://facebook.github.io/react/blog/2013/06/05/why-react.html
