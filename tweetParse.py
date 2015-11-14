try:
    import json
except ImportError:
    import simplejson as json

# Import the necessary methods from "twitter" library
from twitter import Twitter, OAuth, TwitterHTTPError, TwitterStream

# Variables that contains the user credentials to access Twitter API 
ACCESS_TOKEN = '3843303509-g3iFsHNxjVUfWml1wkPwwrvAuxzLhV5BZezLFzR'
ACCESS_SECRET = 'iCh01KDauwYMj4mYfqOIIvWQFafNRGJz6AhXC9zM9daA5'
CONSUMER_KEY = 'FRkxZ28y55sbr8oScY6qNsVeQ'
CONSUMER_SECRET = 'NmGUxz5NJAIT3lx4X4T5G0cLkr7MwYgoHkuZ52Np3vYZNz51m7'

oauth = OAuth(ACCESS_TOKEN, ACCESS_SECRET, CONSUMER_KEY, CONSUMER_SECRET)

twitter = Twitter(auth=oauth)
smallestID = '962046407113732096'

for i in range(19):
	trumpTweets = twitter.statuses.user_timeline(trim_user='true', max_id=smallestID, 
		include_rts='false', user_id='25073877', 
		screen_name='realDonaldTrump', lang='en', count=200)

	tweets_filename = 'trump.txt'
	tweets_file = open(tweets_filename, "a")
	tweets_file.write(json.dumps(trumpTweets, indent=4))


	f = open('trumptext.txt', 'a')
	with open(tweets_filename,"r") as infile:
	    for line in infile:
	    	#print(line[0:16])
	    	if(line[0:15] == '        "text":'):
	    		#print('hi')
	        	f.write(line[17:-4])
	        	f.write(' ')
	        if(line[0:17] == '        "id_str":'):
	        	currentID = line[19:-4]
	        	#print(currentID)
	        	smallestID = long(currentID) - 1

	print(smallestID)


# for line in tweets_file:
#     try:
#         # Read in one line of the file, convert it into a json object 
#         tweet = json.loads(line.strip())
#         if 'text' in tweet: # only messages contains 'text' field is a tweet
#             print tweet['id'] # This is the tweet's id
#             print tweet['created_at'] # when the tweet posted
#             print tweet['text'] # content of the tweet
                        
#             print tweet['user']['id'] # id of the user who posted the tweet
#             print tweet['user']['name'] # name of the user, e.g. "Wei Xu"
#             print tweet['user']['screen_name'] # name of the user account, e.g. "cocoweixu"

#             hashtags = []
#             for hashtag in tweet['entities']['hashtags']:
#             	hashtags.append(hashtag['text'])
#             print hashtags

#     except:
#         # read in a line is not in JSON format (sometimes error occured)
#         continue

