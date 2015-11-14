import json, sys, codecs, re
from twitter import Twitter, OAuth, TwitterHTTPError
if len(sys.argv) > 1:
    screenname = sys.argv[1]
else:
    screenname = 'realDonaldTrump'
apikey = 'QKeGwK39iGzWLSzcBPRN038vH'
apisecret = 'WcAtHvSDY7UkBgA1o8VgSOIeDqctnhncy49VXUkasFWEFfhqjw'
accesstoken = '624850224-yRga3n3qzgyRChfO95sDmEe9cpSlnQg75FRfQuVg'
accesstokensecret = 'GGK6Wa6cdlGe1zxOe19zpuEr7WFolqlNtL1tDpsUth29M'

oauth = OAuth(accesstoken, accesstokensecret, apikey, apisecret)

twitter = Twitter(auth=oauth)
smallestID = '962046407113732096'

outfile = codecs.open('trumpText3.txt', encoding='utf-8', mode='w')

for i in range(19):
    data = twitter.statuses.user_timeline(trim_user='true', max_id=smallestID, 
		include_rts='false', screen_name=screenname, lang='en', count=200)
    for x in data:
        toWrite = x['text']
        smallestID = x['id']
        if toWrite[0] == '"':
            continue
        toWrite = toWrite.replace('&amp;', '&')
        toWrite = toWrite.replace('.@', '@')
        toWrite = re.sub(r'^ ', '', toWrite)
        toWrite = re.sub(r'https?://t.co/\w+', '', toWrite)
        toWrite = re.sub(r'[\s]+', ' ', toWrite) + '` '
        outfile.write(toWrite)
outfile.close()