_ = lodash;

// a little helper function to force an async
// operation in meteor, without losing error 
// logging
forceAsync = (error) => {
    if (error) log.trace(error);
};

// create logger
log = loglevel.createAppLogger('trumpr', 'trace');