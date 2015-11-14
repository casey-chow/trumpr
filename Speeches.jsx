Speeches = React.createClass({
    renderSpeeches() {

    },

    render() {
        return (
            <section {...this.props} >
                <header className="page-header">
                    <h1>Speeches <small>{this.props.author}</small></h1>
                </header>
                <article>
                    {this.renderSpeeches()}
                </article>
            </section>
        );
    }
});