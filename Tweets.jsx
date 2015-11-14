Tweets = React.createClass({
    defaultTweets: [
        'Cras justo odio',
        'Dapibus ac facilisis in',
        'Morbi leo risus',
        'Porta ac consectetur ac',
        'Vestibulum at eros'
    ],

    renderTweets(tweets) {
        return tweets.map(function (tweet, key) {
            return <li className="list-group-item" key={key}>{tweet}</li>;
        });
    },

    render() {
        console.log(this.defaultTweets);
        return (
            <section {...this.props} >
                <header className="page-header">
                    <h1>Tweets <small>@{this.props.author}</small></h1>
                </header>
                <ul className="list-group">
                    {this.renderTweets(this.defaultTweets)}
                </ul>
            </section>
        );
    }
});