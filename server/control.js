Meteor.startup(function () {
    // code to run on server at startup
    // Configuration of smtp to send emails - DO IT WITH AWS!

    // Configuración de safekids
   smtp = {
        /*username: 'AKIAI53P3V462XOXIE2Q',
         password: 'AtBljcpM+s5SxpHJDvCLggVxORoI16W+mvblxssfEFdQ',
         server: 'email-smtp.eu-west-1.amazonaws.com',
         port: 587*/
        username: 'soporte@safekids.es',
        password: 'cambiarpass',
        server: 'correo.hi-iberia.es',
        port: 465
    }

    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;

    Accounts.emailTemplates.resetPassword.text = function (user, url) {
        var url = url.replace('#/', '');
        //var id = url.substring(url.lastIndexOf('/') + 1);
        return "Hola, \n\nHaga click en el link de abajo para reestablecer su contraseña: "+ url;
    }

    Accounts.emailTemplates.from = "Multi-Hiiberia <soporte@hi-iberia.es>";
    Accounts.emailTemplates.siteName = "MultiHIIberia";
    Accounts.emailTemplates.verifyEmail.subject = function (user) {
        return "Confirme su dirección de correo electrónico, " + user.username;
    }
    Accounts.emailTemplates.verifyEmail.text = function (user, url) {
        return "Hola, \n\nHaga click en el siguiente link para verificar su correo electrónico: " + url;
    }

    // Global Account configuration - send verification email when new sign ups
    Accounts.config({
        sendVerificationEmail: true
    });

    // Add a custom field to user's account to know if its device has been connected
    Accounts.onCreateUser(function (options, user) {
        user.deviceConnected = false;
        return user;
    });

	//var http = Npm.require('http');
    //var socket= Npm.require('socket.io');

    /*$(window).bind('beforeunload', function() {
        closingWindow();

        // have to return null, unless you want a chrome popup alert
        return null;

        // have to return null, unless you want a chrome popup alert
        //return 'Are you sure you want to leave your Vonvo?';
    });

    closingWindow = function(){
         alert('closingWindow');
         Meteor.call('deleteUsernamefromRoom', 'room');
    }*/

    //var status = Meteor.status();
    //console.log(JSON.stringify(status));

    //socket.io
/*    server = Meteor.npmRequire("http").createServer();
    server.listen(4000, "localhost");
    socket= Meteor.npmRequire('socket.io');
    nuevo_io = socket.listen(server);
    nuevo_io.sockets.on('connection', function(socket) {
       console.log('***** socket.io connection established');  // Debug
        socket.on('register', function(registerInformation) {
            // Register userid and its associated information to the signaling socket.
            // 'content' is expected to be a JSON string, containing the following fields:
            //     - room
            //     - userid
            //     - name
            //     - comments
            //     - etc.
            console.log('Registering user ' + registerInformation.userid + ' into group ' + registerInformation.groupid);
        });

    });*/

/*    Meteor.methods({
        'getSocket': function () {
            var server = Meteor.npmRequire("http").createServer();
            server.listen(4000, "localhost");
            var socket= Meteor.npmRequire('socket.io');
            var nuevo_io = socket.listen(server);
            //console.log(nuevo_io);

            return nuevo_io;
        }
    });*/

//var GithubApi = Npm.require('github');
//  var github = new GithubApi({
//      version: "3.0.0"
//  });

	var server = Npm.require("http").createServer();
        server.listen(4000, "localhost");
        var socket= Npm.require('socket.io');
        var nuevo_io = socket.listen(server);

Meteor.methods({
    'prueba_llamar_server': function() {
//	var GithubApi = Npm.require('github');
//  	var github = new GithubApi({
//     		 version: "3.0.0"
//  	});
//      var gists = Async.runSync(function(done) {
//        github.gists.getFromUser({user: 'arunoda'}, function(err, data) {
//          done(null, data);
//        });
//      });
      //console.log(gists.result);
//      return gists.result;


	return "hola";
    }
  });

//Meteor.publish ("socket_signal", function()
//{
//	return nuevo_io;
//});



});
