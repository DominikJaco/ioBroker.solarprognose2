const { tests } = require('@iobroker/testing');  

tests.unit('adapter.js', {  
    additionalMockedModules: {  
        '{CONTROLLER_DIR}/lib/tools': { /* Mocks hier */ }  
    }  
});
tests.unit('.', {
    additionalMockedModules: {
        '{CONTROLLER_DIR}/lib/tools': {}
    }
});