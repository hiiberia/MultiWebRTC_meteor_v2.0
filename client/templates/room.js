var ERRORS_KEY = "roomErrors";


//*****************código para que al cerrar ventana, se salga de la sala*****************
$(window).bind('beforeunload', function() {
    closingWindow();

    Meteor.logout();
    // have to return null, unless you want a chrome popup alert
    //return null;

    // have to return null, unless you want a chrome popup alert
    return '¿Está seguro de que quieres salir de la sala?';
});
//*****************************************************************************************

/*$(window).bind('unload', function() {
    closingWindow();

    Meteor.logout();
    // have to return null, unless you want a chrome popup alert
    return null;

    // have to return null, unless you want a chrome popup alert
    //return 'Are you sure you want to leave your Vonvo?';
});*/

closingWindow = function(){
    console.log('closingWindow');
    var currentUrl = Router.current().url;
    var roomName = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    Meteor.call('deleteUsernamefromRoom', roomName, Meteor.user().username);
}

/* Start video when you enter a room*/
Template.room.rendered = function() {
    registerUser();
}
       
Template.room.helpers({
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'has-error';
    }
    /*localvideo: function (){
        //setTimeout(function(){ 
            //var localvideo = document.getElementById('local-video');
            connectSignallingServer();
            registerUser();
            getLocalMedia();
            /*getLocalMedia(function(){
                var localvideo = document.getElementById('local-video');
                attachMediaStream(localvideo, localMediaStream);
                getRegisteredUsers();
            });*/
            

       // }, 3000);
        
    //}
});

Template.room.events({
    'click #buttonQuit': function (event, template) {
        console.log("Se pulsa quit!");
        var currentUrl = Router.current().url;
        var roomName = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
        console.log(roomName);
        console.log(Session.get('currentUsername'));

        Meteor.call('deleteUsernamefromRoom', roomName, Session.get('currentUsername') );
        //parent.history.back();
        quit();
        Meteor.logout();
        Router.go('joinRoom');


        return false;
    },
    //primera versión: botón para obtener el vídeo local
    'click #startvideo': function() {
        //connectSignallingServer();
        //registerUser();
        //getLocalMedia();
  
    },
    'click #buttonOpenChat': function (event, template) {
        alert ("Aún no implementado!");
        //Errors.throw("Aún no implementado");
    },
    'click #sendFile': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonShareDesktop': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonAutoFocus': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonMute': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonVolumeControl': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonPause': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonRecord': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonResize': function (event, template) {
        alert ("Aún no implementado!");
    }
});