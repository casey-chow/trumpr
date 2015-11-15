App = React.createClass({
    render() {
        return (
            <div className="container">
                <Navigation />
                <Header />
                <main className="row">
                    <Tweets className="col-md-4" author="realDonaldTrump" />
                </main>
            </div>
        );
    }
});