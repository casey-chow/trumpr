const {Link} = ReactRouter;

Navigation = React.createClass({
    render() {
        return (
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse" aria-expanded="false">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <a className="navbar-brand" href="#">Need More Donald?</a>
                    </div>

                    <div className="collapse navbar-collapse" id="navbar-collapse">
                        <ul className="nav navbar-nav">
                            <li><Link to="/a/theRealDonaldTrump">Donald Trump <span className="sr-only">(current)</span></Link></li>
                            <li><Link to="/a/BarackObama">Barack Obama</Link></li>
                        </ul>
                        <form className="navbar-form navbar-right" id="custom-handle">
                            <div className="form-group">
                                <input type="text" className="form-control" placeholder="Twitter Handle" />
                            </div>
                        </form>
                    </div>

                </div>
            </nav>
        );
    }
});