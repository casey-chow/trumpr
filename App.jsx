App = React.createClass({
    render() {
        return (
            <div className="container">
                <Navigation />
                <main className="row">
                    {this.props.children}
                </main>
            </div>
        );
    }
});