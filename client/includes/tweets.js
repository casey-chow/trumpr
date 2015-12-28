Template.tweets.helpers({
    tweets: function(user) {
        return ReactiveMethod.call('generateMarkovTweets', user, 10);
    },
    userProfile: function(user) {
        return ReactiveMethod.call('getUserData', user);
    }
});

// TODO: turn this into a pubsub thing

// Meteor.call('getTweets', 1, this.props.author);
//         // }, 100)
        
//         return this.data.tweets
//         .slice(this.data.tweets.length - 10, this.data.tweets.length)
//         .reverse()
//         .map(function (tweet, key) {
//             return (
//                 <li className="list-group-item" key={key}>
//                     <div><div className="image"><img src={tweet.picURL} id="prof"></img></div>
//                     <div className="text">
//                         <div className="textHead"><b>{tweet.authorFullName} </b>
//                             <font color="gray"><small>@{tweet.authorHandle} · {tweet.date}</small></font></div> {tweet.text}
//                         </div>
//                     </div>
//                 </li>
//             );
//         });