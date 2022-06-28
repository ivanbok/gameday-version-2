var GameDayApp = window.GameDayApp || {};

(function scopeWrapper($) {

    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var token = null;

    var lastChat = null;

    var apiClient = apigClientFactory.newClient();

    GameDayApp.checkLogin = function (redirectOnRec, redirectOnUnrec) {
        var cognitoUser = userPool.getCurrentUser();
        if (cognitoUser !== null) {
            if (redirectOnRec) {
                window.location = '/index.html';
            }
        } else {
            if (redirectOnUnrec) {
                window.location = '/';
            }
        }
    };

    GameDayApp.login = function () {
        var username = $('#username').val();
        var authenticationData = {
            Username: username,
            Password: $('#password').val()
        };

        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function () {
                window.location = '/index.html';
            },
            onFailure: function (err) {
                alert(err);
            }
        });
    };

    GameDayApp.logout = function () {
        var cognitoUser = userPool.getCurrentUser();
        cognitoUser.signOut();
        window.location = '/index.html';
    };

    GameDayApp.signup = function () {
        var username = $('#username').val();
        var password = $('#password').val();
        var email = new AmazonCognitoIdentity.CognitoUserAttribute({
            Name: 'email',
            Value: $('#email').val()
        });

        userPool.signUp(username, password, [email], null, function (err, result) {
            if (err) {
                alert(err);
            } else {
                window.location = '/confirm.html#' + username;
            }
        });
    };

    GameDayApp.register = function () {
        window.location = `https://${appclientname}.auth.ap-southeast-1.amazoncognito.com/signup?client_id=${poolData.ClientId}&response_type=code&scope=email+openid+phone+profile&redirect_uri=https://${cloudfronturl}/index.html`;        ;
    };

    GameDayApp.confirm = function () {
        var username = location.hash.substring(1);
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: userPool
        });
        cognitoUser.confirmRegistration($('#code').val(), true, function (err, results) {
            if (err) {
                alert(err);
            } else {
                window.location = '/';
            }
        });
    };

    GameDayApp.resend = function () {
        var username = location.hash.substring(1);
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: userPool
        });
        cognitoUser.resendConfirmationCode(function (err) {
            if (err) {
                alert(err);
            }
        })
    };

    GameDayApp.useToken = function (callback) {
        if (token === null) {
            var cognitoUser = userPool.getCurrentUser();
            if (cognitoUser !== null) {
                cognitoUser.getSession(function (err, session) {
                    if (err) {
                        window.location = '/';
                    }
                    token = session.getIdToken().getJwtToken();
                    callback(token);
                });
            }
        } else {
            callback(token);
        }
    };

}(jQuery));