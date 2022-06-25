var poolData = {
    UserPoolId: 'ap-southeast-1_XC80x3JC5',
    ClientId: 'enolqv49jfs6thrvr3ceaaq1c'
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
userPool.getCurrentUser().getSession(function(err, session) {
    console.log(session.getIdToken().getJwtToken());
    fetch('https://2foxz7t1qb.execute-api.ap-southeast-1.amazonaws.com/prod/betresults?username=${userPool.getCurrentUser().username}', {
    method: 'GET', // or 'PUT'
    headers: {
        'Authorization': session.getIdToken().getJwtToken(),
    },
    })
    .then(response => response.json())
    .then(data => {
    console.log('Success:', data);
    })
    .catch((error) => {
    console.error('Error:', error);
    });
})

