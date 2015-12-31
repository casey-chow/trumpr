Template.navigation.helpers({
    active(template) {
        if (Blaze._globalHelpers['currentTemplate'] === template) 
            return 'active';
    }       
});