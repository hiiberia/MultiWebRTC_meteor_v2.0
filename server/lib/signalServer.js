const SOCKET_IO_DEBUG_MODE = false;
//const CONFIG_FILE = './config.conf';

//const GROUP_URL_PATTERN = /\/webrtc_multi\/([a-zA-Z0-9]+)(\/?)$/;
//const GROUP_URL_PATTERN = /\/webrtc_multi\/([a-zA-Z0-9\?=\+]+)/;
const GROUP_URL_PATTERN = /\/webrtc_multi\/.+/;
const GROUP_NAME_URL_PATTERN = /\/webrtc_multi\/([a-zA-Z0-9]+)/;

const GET_REGISTERED_USERS_URL_PATTERN = /\/users\/list(\/?)$/;


const HTML_CONTENT_DIR = './html/';
const MAIN_INDEX = './html/index.html';
const LOGIN_PAGE = './html/login.html';
//------------ Call states ----------------------------------------------
const STATE_INITIATING = 'initiating';
const STATE_RINGING = 'ringing';
const STATE_ESTABLISHED = 'established';
const STATE_TERMINATING = 'terminating';
const STATE_TERMINATED = 'terminated';
const STATE_IDLE = 'idle';
// -----------------------------------------------------------------------


// ------------ Signalling message names ---------------------------------
const INVITE = 'invite';
const SESSION_PROGRESS = 'sessionProgress';  // ~ 183 (Session Progress)
const OK = 'ok';  // ~ 200 (OK)
const BYE = 'bye';
const ACK = 'ack';
const ICE_CANDIDATE = 'iceCandidate';
const RINGING = 'ringing';  // ~ 180 (Ringing)
const DECLINE = 'decline';  // ~ 603 (Decline)
const BUSY = 'busy';  // ~ 600 (Busy Everywhere)
const UPDATE_FLAG_SHARESCREEN = 'updateShareScreen';
const STOP_SHARE_SCREEN = 'stopShareScreen';
// -----------------------------------------------------------------------

// ------------ Modules --------------------------------------------------
var https = Npm.require('https');
var util = Npm.require('util');
//var registrar = Npm.require('./registrar.js');
var fs = Npm.require('fs');
var mongoCliente = Npm.require('mongodb').MongoClient;
db = null;
mongoCliente.connect("mongodb://localhost:3001/meteor", function(err, database) {
//mongoCliente.connect("mongodb://localhost:27017/schoolbook", function(err, database) {
	if(!err) {
		log("Connected to Mongodb from NodeJS");
		db = database;
	}
});

//------------------------------------------------------------------------


var signalServer = Npm.require( 'http' ).createServer( function(req, res){
	var url = Npm.require('url').parse(req.url);
	if (GET_REGISTERED_USERS_URL_PATTERN.test(url.path)) {
		log('Listing registered users: ' + url.path);  // Debug

		list_registered_users(res);
	}else if(TEST_WRTC.test(url.path)){
		fs.createReadStream('/home/manuel/PROYECTOS/Github/LIFEonLive-rtc/server/lib'+ '/testWebRTC/index.html').pipe(res);
	}else {
		var file_path = '/home/manuel/PROYECTOS/Github/LIFEonLive-rtc/server/lib/testWebRTC' + url.path;
		log('Getting resource file ' + file_path);  // Debug
		try {
			fs.exists(file_path, function(exists) {
				if (exists) {
					fs.stat(file_path, function(err, stats) {
						if (stats.isDirectory()) {
							// No directory inspection is allowed
							log('Requested path is a directory ' + url.path + '. Sending 404 response');  // Debug
							res.writeHead(404, {'Content-Type': 'text/html'});
							res.end('<html><body><h1>404 Resource does not exist</h1></body></html>');
						}
						else {
							content_type = getContentType(file_path);
							res.writeHead(200, {'Content-Type': content_type, 'Transfer-Encoding': 'chunked'});
							fs.createReadStream(file_path).pipe(res);
						}
					});
				}else {
					log("File does not exist");
					res.writeHead(404, {'Content-Type': 'text/html'});
					res.end('<html><body><h1>404 Resource does not exist</h1></body></html>');
				}
			});
		} catch (e) {
			log('Error geting resource file: ' + file_path);  // Debug
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.end('<html><body><h1>404 Resource does not exist</h1></body></html>');
		}
	}
	return;
}).listen( SERVER_PORT, function () {
    log( "SignalServer listening> " + SERVER_IP + ":" + SERVER_PORT );
});

/**
 * 
 * 
 * @param res
 */
/*function list_registered_users(res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Registered users:\n' + util.inspect(groups) + 
			'\n--------------------------------------------\nRegistered signalling sockets:\n' + util.inspect(signallingSockets) + 
			'\n--------------------------------------------\nUser sockets:\n' + util.inspect(registeredUsersSignallingSockets) + 
			'\n--------------------------------------------\nSession states:\n' + util.inspect(sessionStates));
}*/


	
function getContentType(filePath) {
	splits = filePath.split('.');
	if (splits.length < 2)
		return "text/plain";
	ext = splits[splits.length-1];
	ext = ext.toLowerCase();
	if (ext == "js") {
		return "text/javascript";
	}
	else if (ext == "css") {
		return "text/css";
	}
	else if (ext == "html" || ext == "htm") {
		return "text/html";
	}
	else if (ext == "jpg" || ext == "jpeg") {
		return "image/jpeg";
	}
	else if (ext == "gif") {
		return "image/gif";
	}
	else if (ext == "png") {
		return "image/png";
	}
	else if (ext == "mp3") {
		return "audio/mpeg";
	}
	else if (ext == "wav") {
		return "audio/wav";
	}
	return "text/plain";
}

//console.log('Server running at ' + SERVER_IP + ':' + SERVER_PORT);
//console.log('Server running at ' + configurationOptions.server_ip + ':' + configurationOptions.server_port);

// Socket.io
var io = Npm.require('socket.io').listen(signalServer, {log: SOCKET_IO_DEBUG_MODE});
io.sockets.on('connection', function(socket) {
	console.log('***** socket.io connection established');  // Debug
	// Registration
	// 
	socket.on('register', function(registerInformation) {
		// Register userid and its associated information to the signaling socket.
		// 'content' is expected to be a JSON string, containing the following fields:
		//     - room
		//     - userid
		//     - name
        //     - comments
        //     - etc.
        console.log ('<-- REGISTER ******************');
		console.log('Registering user ' + registerInformation.userid + ' into group ' + registerInformation.groupid);
		// Comprobar si el usuario está registrado
		// TODO
		// En caso contrario registrarlo 
		registerUserR(registerInformation.groupid, registerInformation.userid, registerInformation, socket);
		
		//socket.username = registerInformation.userid;
		//socket.room = registerInformation.groupid;
		socket.join(registerInformation.groupid);
		var registeredUsers = getRegisteredUsers(registerInformation.groupid);
		console.log ('--> usersInformationUpdate ******************');
		socket.broadcast.to(registerInformation.groupid).emit('usersInformationUpdate',registeredUsers);
		
		socket.on('close', function() {
			console.log ('<-- CLOSE ******************');
			console.log('Signalling connection is closed');
			deregisterUser(registerInformation.groupId, registerInformation.userid);
			deregisterScreen(deregisterInformation.groupId, deregisterInformation.userid);
			// Clean up
			// TODO
		});
	});
	
	// Deregistration
	socket.on('deregister', function(deregisterInformation) {
		// Deregister userid.
		// 'content' is expected to be a JSON string, containing at least the following
		// field;
		//     - userid
		console.log ('<-- DEREGISTER ******************');
		deregisterUser(deregisterInformation.groupId, deregisterInformation.userId);
	});
	
	// Invite
	socket.on(INVITE, function(message) {
		console.log ('<-- INVITE ******************');
		console.log('<- Received invite: ' + util.inspect(message));
		// 1. Create session state
		addSessionState(message.callId, message.group, message.transactionId, [message.from, message.to], STATE_INITIATING);
		// 2. Send invite to destination
		var destination_socket = getSignallingSocket(message.group, message.to);
		console.log('destination_socket for group ' + message.group + ' and destination ' + message.to + ': ' + destination_socket);  // Debug
		if (destination_socket) {
			console.log ('--> INVITE ******************');
			destination_socket.emit(INVITE, message);
			console.log('-> Sending invite to ' + message.to + ' in group ' + message.grou + ' through signalling socket ' + destination_socket.id + ': ' + util.inspect(message));
		}
	});

	// IceCandidate
	socket.on(ICE_CANDIDATE, function(message) {
		console.log ('<-- ICE_CANDIDATE ******************');
		console.log('<- Received iceCandidate: ' + util.inspect(message));
		// 1. Send to destination
		var destination_socket = getSignallingSocket(message.group, message.to);
		if (destination_socket) {
			console.log ('--> ICE_CANDIDATE******************');
			destination_socket.emit(ICE_CANDIDATE, message);
			console.log('-> Sending iceCandidate to ' + message.to + ' in group ' + message.group + ' through signalling socket ' + destination_socket.id + ': ' + util.inspect(message));
		}
	});
	
	// SessionProgress
	socket.on(SESSION_PROGRESS, function(message) {
		console.log ('<-- SESSION_PROGRESS ******************');
		console.log('<-- Received sessionProgress: ' + util.inspect(message));
		// 1. Send to caller
		var destination_socket = getSignallingSocket(message.group, message.from);
		if (destination_socket) {
			console.log ('--> SESSION_PROGRESS ******************');
			destination_socket.emit(SESSION_PROGRESS, message);
			console.log('-> Sending sessionProgress to ' + message.from + ' in group ' + message.group + ' through signalling socket ' + destination_socket.id + ': ' + util.inspect(message));
		}
	});

	// Ringing
	socket.on(RINGING, function(message) {
		console.log ('<-- RINGING ******************');
		console.log('<-- Received ringing: ' + util.inspect(message));
		// 1. Send to caller
		var destination_socket = getSignallingSocket(message.group, message.from);
		if (destination_socket) {
			console.log ('--> RINGING ******************');
			destination_socket.emit(RINGING, message);
			console.log('-> Sending ringing to ' + message.from + ' in group ' + message.group + ' through signalling socket ' + destination_socket.id + ': ' + util.inspect(message));
		}
		
		// 2. Update call state
		updateSessionState(message.callId, {state: STATE_RINGING});
	});
	
	// Bye
	socket.on(BYE, function(message) {
		console.log ('<-- BYE ******************');
		console.log('<-- Received bye: ' + util.inspect(message));
		// 1. Send to destination
		var destination_socket = getSignallingSocket(message.group, message.to);
		if (destination_socket) {
			console.log ('--> BYE ******************');
			destination_socket.emit(BYE, message);
			console.log('-> Sending bye to ' + message.to + ' in group ' + message.group + ' through signalling socket ' + destination_socket.id + ': ' + util.inspect(message));
			// 2. Update call state
			updateSessionState(message.callId, {state: STATE_TERMINATING});
		}
		else {
			// 2. If no destination_socket is found, then the calls is supposed to be already finished.
			// Therefore, remove the corresponding session information.
			console.log('Removing session information for callId: ' + message.callId + ' since no signalling socket was found for destination user; therefore, the corresponding call should habe been already ended.');
			removeSessionState(message.callId);
		}
	});

	// Ok
	socket.on(OK, function(message) {
		console.log ('<-- OK ******************');
		console.log('<-- Received ok: ' + util.inspect(message));
		// 1. Send to destination
		var destination_socket = getSignallingSocket(message.group, message.from);
		if (destination_socket) {
			console.log ('--> OK ******************');
			destination_socket.emit(OK, message);
			console.log('-> Sending ok to ' + message.from + ' in group ' + message.group + ' through signalling socket ' + destination_socket.id + ': ' + util.inspect(message));
			// 2. Update call state
			var call_state = getSessionState(message.callId);
			if (call_state) {
				if (call_state.state === STATE_RINGING) {
					// Call established
					updateSessionState(message.callId, {state: STATE_ESTABLISHED});
				}
				else if (call_state.state === STATE_TERMINATING) {
					// Call terminated
					updateSessionState(message.callId, {state: STATE_TERMINATED});
					// Remove call state information for sending user
					removeUserFromCall(message.from, message.callId);
				}
			}
		}
		else {
			// 2. If no destination_socket is found, then the calls is supposed to be already finished.
			// Therefore, remove the corresponding session information.
			console.log('Removing session information for callId: ' + message.callId + ' since no signalling socket was found for destination user; therefore, the corresponding call should habe been already ended.');
			removeSessionState(message.callId);
		}
		
	});

	// Busy
	socket.on(BUSY, function(message) {
		console.log ('<-- BUSY ******************');
		console.log('<- Received busy: ' + util.inspect(message));
		// 1. Send to destination
		var destination_socket = getSignallingSocket(message.from);
		if (destination_socket) {
			console.log ('--> BUSY ******************');
			destination_socket.emit(BUSY, message);
			console.log('-> Sending busy to ' + message.to + ' through signalling socket ' + destination_socket.id + ': ' + util.inspect(message));
		}
		
		// 2. Update call state
		updateSessionState(message.callId, {state: STATE_TERMINATED});
		// Remove call state information for busy user
		removeUserFromCall(message.group, message.to, message.callId);
		
		// 
	});

	// Client send getRegisteredUsers request.
	// Structure of request is
	//    {groupid : currentGroupId, userid: currentUserId}
	socket.on('getRegisteredUsers', function(request) {
		console.log ('<-- getRegisteredUsers ******************');
		var registeredUsers = getRegisteredUsers(request.groupid);
		console.log ('--> getRegisteredUsers ******************');
		socket.emit('getRegisteredUsersResult', registeredUsers);
	});
	
	// 
	socket.on('disconnect', function() {
		console.log ('<-- disconnect ******************');
		// Get group for current signalling socket.
		var groupid = getGroupidFromSocketid(socket.id);
		// Get user for current signalling socket.
		var userid = getUseridFromSocketid(socket.id);
		
//		// Deregister user for current socket.
//		registrar.deregisterSocket(socket.id);

		deregisterScreen(groupid, userid);

		// Finalize all calls for current user.
		finalizeAllCallsForUser(groupid, userid);

		deregisterUserR(groupid, userid);

		var registeredUsers = getRegisteredUsers(groupid);
		console.log ('--> usersInformationUpdate ******************');
		socket.broadcast.to(groupid).emit('usersInformationUpdate',registeredUsers);
	});
	
	socket.on(UPDATE_FLAG_SHARESCREEN, function(flagInformation){
		console.log ('<-- UPDATE_FLAG_SHARESCREEN ******************');
		var groupid = flagInformation.groupid;
		var userid = flagInformation.userid;
		var data = {shareScreen:flagInformation.shareScreen};
		updateUserInformation(groupid, userid, data);
		
		console.log("flag user update: "+userid);//debug
		//BROADCAST PARA AVISAR DE QUE ESTÁ COMPARTIENDO EL ESCRITORIO
		var msg = {
			userid: userid
		};
		console.log ('--> UPDATE_FLAG_SHARESCREEN ******************');
		socket.broadcast.to(groupid).emit(UPDATE_FLAG_SHARESCREEN, msg);
		console.log("after broadcast");//debug
	});
	
	socket.on(STOP_SHARE_SCREEN, function(stopShareInformation){
		//deregisterScreen(stopShareInformation.groupid, stopShareInformation.userid, socket);
		//check if user is sharing desktop
		console.log ('<-- STOP_SHARE_SCREEN ******************');
		var userid = stopShareInformation.userid;
		var groupid = stopShareInformation.groupid;
		console.log("stop share screen from "+userid+" in group "+groupid);
		var userInformation = getUserInformation(groupid, userid);
		if(userInformation){
			if(userInformation.shareScreen == 1){
				//change option
				var newData = {shareScreen:0}
				updateUserInformation(groupid,userid,newData);
			
				var sessions = getCallScreenSessionsId(groupid, userid);
				console.log("Sessions in stop share screen:");
				console.log(sessions);
				var sessionOrigin = "";
				for(var k in sessions){
					sessionOrigin = sessions[k].callId.split("-")[0];
					console.log("Session origin = "+sessionOrigin);
					if(sessionOrigin == userid){		
						removeSessionState(sessions[k].callId);
						sendBye(userid, sessions[k].dest_user, groupid, sessions[k].callId, sessions[k].transactionId, true);
					}
				}
			
			}
		}
	});
		
	
});


/**
 * Finalizes all calls in which userid, belonging to groupid, participates.
 * 
 * @param groupid
 * @param userid
 */
function finalizeAllCallsForUser(groupid, userid) {
	// 1. Get all currently established calls where userid takes part in groupid.
	current_sessions = getSessionStatesForUserid(groupid, userid);
	console.log(' [finalizeAllCallsForUser] Finalizing calls after user ' + userid + ' has been unregistered: ' + util.inspect(current_sessions));
	
	// 2. Send BYE for every established call got in 1.
	for (var position in current_sessions) {
		var dest_userid = current_sessions[position].dest_userid;
		console.log(' [finalizeAllCallsForUser] Trying to send BYE from:' + userid + ', to:' + dest_userid + ', callId:' + current_sessions[position].callId);
		if((current_sessions[position].callId).indexOf("-screen-") != -1){
			//sendBye(userid, dest_userid, groupid, current_sessions[position].callId, generateTransactionId(BYE), true);
		}else{
			sendBye(userid, dest_userid, groupid, current_sessions[position].callId, generateTransactionId(BYE), false);
		}
	}
}




/**
 * @param content json containing the following fields:
 * <ul>
 * 	<li>userid</li>
 *  <li>name</li>
 *  <li>comments</li>
 *  etc.
 * </ul>
 */
var registerHandler = function(content) {
	var register_information = {};
	register_information.socket = socket;
	registerUserR(content.userid, register_information);
};


///**
// * 
// */
//function deregisterUser(groupId, userid) {
//	// Check wether user is currently involved in a call
//	var user_information = registrar.getUserInformation(groupId, userid);
//	if (user_information) {
//		var current_call_ids = user_information.currentCalls;
//		if (current_call_ids) {
//			for (var i=0; current_call_ids.length; i++) {
//				var current_call_id = current_call_ids[i];
//				// If user is involved in a call, send bye to the other participants
//				var session_state = registrar.getSessionState(current_call_id);
//				if (session_state) {
//					var call_participants = session_state.callParticipants;
//					if (call_participants) {
//						for (var j=0; j<call_participants.length; j++) {
//							if (current_call_id != call_participants[j]) {
//								sendBye(userid, call_participants[j], current_call_id, generateTransactionId(BYE));
//							}
//						}
//						registrar.removeUserFromCall(userid, current_call_id);
//					}
//				}
//			}
//		}
//	}
//	// Deregister user
//	console.log('Deregistering user ' + userid);
//	registrar.deregisterUser(userid);
//
//}


/**
 * 
 */
function deregisterUser(groupid, userid) {
	// Check wether user is currently involved in a call
	var user_information = getUserInformation(groupid, userid);
	if (user_information) {
		var current_call_id = user_information.currentCall;
		if (current_call_id) {
			console.log(" [deregisterUser] User involved in a call "+current_call_id);
			// If user is involved in a call, send bye to the other participants
			var session_state = getSessionState(current_call_id);
			if (session_state) {
				console.log(" [deregisterUser] Session state of call: "+session_state);
				var call_participants = session_state.callParticipants;
				if (call_participants) {
					for (var i=0; i<call_participants.length; i++) {
						if (current_call_id != call_participants[i]) {
							console.log(" [deregisterUser] Send bye");
							sendBye(userid, call_participants[i], groupid, current_call_id, generateTransactionId(BYE), false);
						}
					}
					removeUserFromCall(groupid, userid, current_call_id);
				}
			}
		}
	}
	// Deregister user
	console.log(' [deregisterUser] Deregistering user ' + userid + ' from group ' + groupid);
	deregisterUserR(groupid, userid);

}

/**
*
*/
function deregisterScreen(groupid, userid, socket){
	//check if user is sharing desktop
	console.log(" [deregisterScreen] deregisterScreen from "+userid+" in group "+groupid);
	var userInformation = getUserInformation(groupid, userid);
	if(userInformation){
		if(userInformation.shareScreen == 1){
			//change option
			var newData = {shareScreen:0}
			updateUserInformation(groupid,userid,newData);
			
			var current_call_id = userInformation.currentCall;
			
			var sessions = getCallScreenSessionsId(groupid, userid);
			//console.log("sessions with screen word");
			//console.log(sessions);
			for(var k in sessions){
				//removeSessionState
				removeSessionState(sessions[k].callId);
				
				sendBye(userid, sessions[k].dest_user, groupid, sessions[k].callId, sessions[k].transactionId, true);
			}
			
		}
	}
}


/**
 * 
 * @param from
 * @param to
 * @param group
 * @param callId
 * @param transactionId
 */
function sendBye(from, to, group, callId, transactionId, screen) {
	console.log ('[sendBye]');
	var destination_socket = getSignallingSocket(group, to);
	if (destination_socket) {
		var bye_msg = {from: from,
						to: to,
						callId: callId,
						transactionId: transactionId,
						screen: screen};
		destination_socket.emit(BYE, bye_msg);
		console.log('-> Sending bye: ' + JSON.stringify(bye_msg));
	}
}


function getRandomInteger() {
	return Math.floor((Math.random()*10000000000)+1);
}


function getTimestamp() {
	return new Date().getTime();
}


function generateTransactionId(operation) {
	return operation + '-' + getTimestamp() + '-' + getRandomInteger();
}

/**
 * Get groupId from current request
 * 
 */
/*function getCurrentGroupId(urlPath) {
	console.log('getCurrentGroupId: urlPath: ' + urlPath); // Debug
	if (GROUP_NAME_URL_PATTERN.test(urlPath)) {
		var res = GROUP_NAME_URL_PATTERN.exec(urlPath)[1];
		console.log('getCurrentGroupId(): ' + res); // Debug
		return res;
	}
	return null;
}*/


