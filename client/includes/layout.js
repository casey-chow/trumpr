///////////////////////////////////////////////////////////
// GLOBAL HELPERS                                        //
///////////////////////////////////////////////////////////

// http://stackoverflow.com/a/30697951/237904
Template.registerHelper('currentTemplate', function(){
    return Router.current() && Router.current().route.getName().replace('.','-');
  }
);