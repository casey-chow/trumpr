Template.navigation.helpers({
    active: function(template) {
        var activeTemplate = Router.current() 
                          && Router.current().route.getName().replace('.','-');
        if (activeTemplate = template) return 'active';
    }       
});