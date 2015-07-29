// Signalling node IP
const SIGNALLING_NODE = '192.168.26.173:1337';
//const SIGNALLING_NODE = '192.168.26.167';
//const SIGNALLING_NODE = 'multi.hi-iberia.es';
 
// Default TURN server
const DEFAULT_TURN_SERVER = '54.209.50.224';//'numb.viagenie.ca';
 
// Default STUN server
const DEFAULT_STUN_SERVER = '54.209.50.224';//'stun.l.google.com:19302';
 
// Default TURN server user
const DEFAULT_TURN_SERVER_USER = 'webrtcHi';//'jdelpeso@hi-iberia.es';

// Default TURN server password
const DEFAULT_TURN_SERVER_PASSWORD = 'Hi1930Webrtc';//'webrtchi';
 
// ICE configuration
var peerConnectionConfiguration = {
	'iceServers' : [ {
		'url' : 'turn:' + DEFAULT_TURN_SERVER,
		'username' : DEFAULT_TURN_SERVER_USER,
		'credential' : DEFAULT_TURN_SERVER_PASSWORD
	} ]
};

 

// Only audio selection.
var useOnlyAudio = false;
 
// ---------- Audio and video constraints --------------------------------
// Media constraints for only audio conference.
const ONLY_AUDIO_MEDIA_CONSTRAINTS = {
//	audio : true,
	audio : {mandatory: {googEchoCancellation: true}},  // Activate echo cancellation
	video : false
};
 
// Media constraints for video conference.
const VIDEO_MEDIA_CONSTRAINTS = {
//	audio : true,
        audio : {mandatory: {googEchoCancellation: true}},  // Activate echo cancellation
	video : {
		mandatory : {
			maxWidth: 1280,
			maxHeight: 720
		},
		optional : []
	}
};
 
 
// Media constraints for screen sharing.
const SCREEN_SHARING_MEDIA_CONSTRAINTS_CHROME = {
	audio : false,
	video: {
		mandatory: {
			chromeMediaSource: 'screen',
			maxWidth: 1280,
			maxHeight: 720
		},
		optional: []
	}
};
 
const SCREEN_SHARING_MEDIA_CONSTRAINTS_FIREFOX = {
	audio : false,
	video: {mediaSource: 'window' || 'screen'}
};
 
var SCREEN_SHARING_MEDIA_CONSTRAINTS = null;
 
if (navigator.webkitGetUserMedia) {navigator.webkitGetUserMedia
	console.log('*** Browser is Chrome');  // Debug
	SCREEN_SHARING_MEDIA_CONSTRAINTS = SCREEN_SHARING_MEDIA_CONSTRAINTS_CHROME;
} else if (navigator.mozGetUserMedia) {
	console.log('*** Browser is Firefox');  // Debug
	SCREEN_SHARING_MEDIA_CONSTRAINTS = SCREEN_SHARING_MEDIA_CONSTRAINTS_FIREFOX;
}
 
const SDP_CONSTRAINTS_ONLY_AUDIO = {
	mandatory : {
		OfferToReceiveAudio : true,
		OfferToReceiveVideo : false
	}
};
 
const SDP_CONSTRAINTS_VIDEO = {
	mandatory : {
		OfferToReceiveAudio : true,
		OfferToReceiveVideo : true
	}
};

// -----------------------------------------------------------------------

 
//const GROUP_NAME_URL_PATTERN = /\/users\/([a-zA-Z0-9]+)\/main/;
//const GROUP_NAME_URL_PATTERN = /\/webrtc_multi\/([a-zA-Z0-9]+)\?.*/;
const GROUP_NAME_URL_PATTERN = /\/webrtc_multi\/([a-zA-Z0-9]+)/;
 
// Media constraints
var userMediaConstraints = null;
var sdpConstraints = null;
 
// For interop with FireFox. Enable DTLS in peerConnection ctor.
var peerConnectionConstraints = {
	'optional' : [ {
		'DtlsSrtpKeyAgreement' : true
	} ]
};

 

// ----------- Signalling message names ----------------------------------
const INVITE = 'invite';
const SESSION_PROGRESS = 'sessionProgress'; // ~ 183 (Session Progress)
const OK = 'ok'; // ~ 200 (OK)
const BYE = 'bye';
const ACK = 'ack';
const ICE_CANDIDATE = 'iceCandidate';
const RINGING = 'ringing'; // ~ 180 (Ringing)
const DECLINE = 'decline'; // ~ 603 (Decline)
const BUSY = 'busy'; // ~ 600 (Busy Everywhere)
const UPDATE_FLAG_SHARESCREEN = 'updateShareScreen';
// -----------------------------------------------------------------------

 

// ----------- DOM elements ----------------------------------------------

// Local video elements.
var divLocalVideo = null;
var localVideo = null;

 
// Main remote video elements.
var divRemoteVideo = null;
var remoteVideo = null;

// Local video elements (small).
var divLocalVideoSmall = null;
var localVideoSmall = null;
 
// Local screen elements.
var divLocalScreenVideoSmall = null;
var localScreenVideoSmall = null;
 
// Div containing remote views (including remote video).
var divRemoteViews = null;
 
//// Div element containing video elements
//var card = document.getElementById('divVideoPanel');
 
// Div containing current main video view description informaiton.
var divMainVideoInfo = null;
 
//-- Interface buttons ---------------------------------------------------
 
// Open Chat button
buttonOpenChat = null;
 

// Send File button

buttonSendFile = null;

 
// Share Desktop button
buttonShareDesktop = null;
 
// Auto Focus button
buttonAutoFocus = null;
 
// Mute button
buttonMute = null;
 
// Volume Control button
buttonVolumeControl = null;
 
// Pause button
buttonPause = null;
 
// Record button
buttonRecord = null;
 
// Quit button
buttonQuit = null;
 
//------------------------------------------------------------------------
 
var shareDesktopFlag = false;


// ----------- jQuery elements -------------------------------------------
 
// -----------------------------------------------------------------------
// Signalling socket from socket.io
var signallingSocket = null;
// Local media stream (audio/video).
var localMediaStream = null;
// Local media stream for current stream.
var localScreenStream = null;
 

// ----------- Call state ------------------------------------------------
 
const STATE_IDLE = 'idle'; // ~ BCSM O_NULL
const STATE_INITIATING = 'initiating'; // ~ BCSM O Analysis, Routing and Alerting
const STATE_INITIATING_T = 'initiating_t'; // ~ BCSM T Terminanting Call Handling
const STATE_ESTABLISHED = 'established'; // ~ BCSM O_ACTIVE / T_ACTIVE
const STATE_TERMINATING = 'terminating';
const STATE_TERMINATED = 'terminated'; // ~ BCSM T Terminanting Call Handling
const STATE_RINGING = 'ringing';
 
//-- Calls state information ---------------------------------------------
 

//This variable will contain the state information for every call established
//or in establishing phase.

//Structure: dictionary with

//key: userid (remote user for which connection is established)

//value: object {

//          peerConnection: PeerConnection object,

//          callState: state of call (IDLE, ESTABLISHING, etc.),

//          callId: call's id, initialized during the send Invite message phase,

//          currentTransactionId: id for current transaction,

//          lastInviteMessage: last sent / received invite message.

//                             This information is to be used in hang up procedures,

//          remoteStream: remote stream

//      }
var callsInfo = {};
var callsInfoScreen = {};
// Currently registered users (including current user) in current group.
var registeredUsers = null;
 

// User currently shown in main remote view panel,
// i.e. currently focused remote user.
var userInMainRemoteView = null;

// Whether current screen is being shared.
var sharingScreen = false;
 
//------------------------------------------------------------------------
 
// Group information
var currentGroupId = getCurrentGroupId();
 
// User information
var currentUserId = getCurrentUserId();
var currentUserName = getCurrentUserName();
 

// ?????
//// The other party identity in current call
//// TODO Extend to admit multiparty
//var callParticipant = null;
// ?????
 
// -----------------------------------------------------------------------
 
// ------------ Recording ------------------------------------------------
var recordOnlyAudio = false;
 
// Recording states
const RECORDING_STATE_STOPPED = 'recordingStateStopped';
const RECORDING_STATE_STARTED = 'recordingStateStarted';
 
var recordingState = RECORDING_STATE_STOPPED;
 
const RECORDING_OPTIONS_VIDEO = {
	type : 'video',
	video : {
		width : 320,
		height : 240
	},
	canvas : {
		width : 320,
		height : 240
	}
};
 
const RECORDING_OPTIONS_ONLY_AUDIO = null;
 
var localVideoRecordRTC = null;
var localAudioRecordRTC = null;
var remoteVideoRecordRTC = null;
var remoteAudioRecordRTC = null;
// -----------------------------------------------------------------------

 

// --------------- Audio content -----------------------------------------
// Audio context
var audioContext = createAudioContext();
 
// Ring player
if(audioContext != null){
	var ringPlayer = new RingPlayer(audioContext);
}
// -----------------------------------------------------------------------

 

 

/**
* Gets the size of an object.
*
* @param o
*/
function getObjectSize(o) {
	var res = 0;
	for (var v in o) {
		res++;
	}
	return res;
}
 
 
/**
* Get groupId from current request
*
*/
function getCurrentGroupId() {
	// console.log('getCurrentGroupId: location.pathname : ' + location.pathname); // Debug
	if (GROUP_NAME_URL_PATTERN.test(location.pathname)) {
		var res = GROUP_NAME_URL_PATTERN.exec(location.pathname)[1];
		console.log('getCurrentGroupId(): ' + res); // Debug
		return res;
	}
	return null;
}


/**
* Sets the description shown for the main video element.
*
* @param text Description.
*/
function setMainVideoInfoText(text) {
	var text_node = document.createTextNode(text);
	if (divMainVideoInfo) {
		var children = divMainVideoInfo.childNodes;
		for (var i = 0; i<children.length; i++) {
			console.log('Removing node ' + i + ': ' + children[i]); // Debug
			divMainVideoInfo.removeChild(children[i]);
		}
		divMainVideoInfo.appendChild(text_node);
	}
}

 
/**
 *	Set peerType
 **/
setPeerType = function(type){
    peer_type = type;
}

/**
 * Set groupId from current request
 *
 */
setCurrentGroupId = function(groupId) {
    currentGroupId = groupId;
}


/**
 * Get userid for current request
 *
 */
function getCurrentUserId () {
    return currentUserId;
}

/**
 * Set userid for current request
 *
 */
setCurrentUserId = function(userId) {
    currentUserId = userId;
}

/**
 * Get current user name from URL
 */
function getCurrentUserName() {
    return currentUserName;
}

/**
 * Set current user name from URL
 */
setCurrentUserName = function(userName) {
    currentUserName = userName;
}
 

/**
*
* @param parameters string containing the parameters to be parsed.
*
* @return object { attribute: <value> }
*/

function parseRequestParemeters(parameters) {
	var res = {};
	var param_list;

	if (parameters.indexOf('?') == 0)
		param_list = parameters.slice(1).split('&');
	else
		param_list = parameters.split('&');
		           
	for (var i = 0; i < param_list.length; i++) {
		var p_pair = param_list[i].split('=');
		res[p_pair[0]] = p_pair[1];
	}
	console.log('parseRequestParameters(' + parameters + '): '
		                           + JSON.stringify(res)); // Debug
	return res;
}

 

 

/**
* Register user in registrar.
*/
registerUser = function() {
	// 1. Get local media
	console.log('1. Get local media');
	if (useOnlyAudio) {
		userMediaConstraints = ONLY_AUDIO_MEDIA_CONSTRAINTS;
		sdpConstraints = SDP_CONSTRAINTS_ONLY_AUDIO;
	} else {
		userMediaConstraints = VIDEO_MEDIA_CONSTRAINTS;
		sdpConstraints = SDP_CONSTRAINTS_VIDEO;
	}



//            userMediaConstraints = VIDEO_MEDIA_CONSTRAINTS;
//            sdpConstraints = SDP_CONSTRAINTS_VIDEO;


	
	localVideo = document.getElementById('localVideo');
	divLocalVideo = document.getElementById('divLocalVideo');
	remoteVideo = document.getElementById('remoteVideo');
	divRemoteVideo = document.getElementById('divRemoteVideo');
	localVideoSmall = document.getElementById('localVideoSmall');
	divLocalVideoSmall = document.getElementById('divLocalVideoSmall');
			                    
	divLocalScreenStream = document.getElementById('divLocalScreenVideoSmall');
	localScreenVideoSmall = document.getElementById('localScreenVideoSmall');
			                    
	divRemoteViews = document.getElementById('divRemoteViews');
	divMainVideoInfo = document.getElementById('divMainVideoInfo');
					
			                    
			                    

	// 1. Open signalling channel and register current user in signalling server
	console.log('2. Register current user in signalling server');
	signallingSocket = io.connect(SIGNALLING_NODE);
	signallingSocket.emit('register', {
		groupid : currentGroupId,
		userid : currentUserId,
		name : currentUserName,
		shareScreen: 0
	});



	// 2. Get local media.
	getUserMedia(userMediaConstraints, function(mediaStream) {
		localMediaStream = mediaStream;
		localVideo = document.getElementById('local_video');
        attachMediaStream(localVideo, localMediaStream);
		localVideo.style.opacity = 1;
		console.log('Requested access to local media with mediaConstraints:\n'
				    + '  \'' + JSON.stringify(userMediaConstraints) + '\'');

		// Get all users already registered in current group.
		// Response to this call initiates the all interactions.
		// As a result of the execution of this function, the 'getRegisteredUsersResult'
		// will be received. This message is processed in point 2.1.2.
		getRegisteredUsersAndEstablishConnections();

	}, function(err) {
		console.log("Error getting local media during registration: " + err);
	});



	// 2.1. Register signalling events

	// 2.1.0 This message will be received when an user share screen

	signallingSocket.on(UPDATE_FLAG_SHARESCREEN, function(userInformation){
		//console.log(registeredUsers);
		var localUserInfo = registeredUsers[userInformation.userid];
		//console.log(localUserInfo);
		localUserInfo.shareScreen = 1;
		//console.log(localUserInfo);

		//NEW INITCALL TO REMOTE SCREEN
		//TODO
	});

	// 2.1.1. This message will be received whenever register information is changed for
	// current groupId.
	signallingSocket.on('usersInformationUpdate', function(usersInformation) {
		refreshRegisteredUsers(usersInformation);  // TODO
	});



	// 2.1.2. This message will be received as a response to the getRegisteredUsers request
	// sent just after registering current user in current groupid.
	signallingSocket.on('getRegisteredUsersResult', function(usersInformation) {
		// Establish connections
		registeredUsers = usersInformation;
		delete registeredUsers[currentUserId];  // Remove current user id
		establishConnections(registeredUsers);
	});



	// Invite
	// TERMINATING CALL
	signallingSocket.on(INVITE, function(message) {
		console.log('<-- Received invite: ' + JSON.stringify(message));

		var flagScreen = message.screen;

		if(!flagScreen){
			// Add entry to callsInfo
			// A new connection must be established with the invite message sender
			var call_info = {};
			callsInfo[message.from] = call_info;

			call_info.lastInviteMessage = message;
			//call_info.callParticipant = message.from;
			call_info.currentCallId = message.callId;
			setCallStateInitiatingT(message.from);
			console.log(callsInfo);
		}else{
			// Add entry to callsInfo
			// A new connection must be established with the invite message sender
			var call_infoScreen = {};
			callsInfoScreen[message.from] = call_infoScreen;

			call_infoScreen.lastInviteMessage = message;
			//call_info.callParticipant = message.from;
			call_infoScreen.currentCallId = message.callId;

			// Update call state
			setCallStateInitiatingTScreen(message.from);
			console.log(callsInfoScreen);
		}

		// Send ringing
		sendRinging(message.from, message.to, currentGroupId, message.callId, message.transactionId, message.screen);

		//// Start ringing
		//ringPlayer.start();  // TODO ????


		//// Stop ringing
		//ringPlayer.stop();

		//Llega un INVITE para compartir la cámara
		if(!flagScreen){
			createRTCPeerConnectionTerminating(message);
			// Success callback is sent in createRTCPeerConnectionTerminating;
			// setRemoteDescription is set there too.
		}else{
			createRTCPeerConnectionTerminatingScreen(message);
		}

		//                  // Send ok
		//                  sendOk(message.from, message.to, currentGroupId, message.callId, message.transactionId);

		// Add local media stream
		console.log('Adding local media stream');
		if(!flagScreen){
			call_info.peerConnection.addStream(localMediaStream);
		}else{
			//no pongo ningún medio local
			//call_info.peerConnectionScreen.addStream(localScreenStream);
		}
		// Send ok
		sendOk(message.from, message.to, currentGroupId, message.callId, message.transactionId, flagScreen);

		// Update call state
		if(!flagScreen){
			setCallStateEstablished(message.from);
		}else{
			setCallStateEstablishedScreen(message.from);
		}

	});



	// iceCandidate
	signallingSocket.on(ICE_CANDIDATE, function(message) {
		console.log('<-- Received iceCandidate: ' + JSON.stringify(message));
		var candidate = new RTCIceCandidate({
			sdpMLineIndex : message.iceCandidate.label,
			candidate : message.iceCandidate.candidate
		});
		console.log('Adding candidate: ' + JSON.stringify(candidate));

		if(message.screen){
			// Check whether candidates are referred to current call; if not, ignore
			// them.
			var call_infoScreen = callsInfoScreen[message.from];
			//if (message.callId == call_info.currentCallId) {

			if (call_infoScreen.peerConnectionScreen)
				call_infoScreen.peerConnectionScreen.addIceCandidate(candidate);
		}else{
			// Check whether candidates are referred to current call; if not, ignore
			// them.
			var call_info = callsInfo[message.from];

			if (call_info.peerConnection)
				call_info.peerConnection.addIceCandidate(candidate);
		}

		//}
	});



	// sessionProgress (answer)
	signallingSocket.on(SESSION_PROGRESS, function(message) {
		console.log('<-- Received sessionProgress (answer): ' + JSON.stringify(message));
		var sdp_conf = {sdp : message.sdp, type : 'answer'};
		console.log('Setting remote description: ' + JSON.stringify(sdp_conf));

		if(message.screen){
			var call_infoScreen = callsInfoScreen[message.to];
			//console.log(callsInfo);
			//console.log(call_info);

			call_infoScreen.peerConnectionScreen.setRemoteDescription(new RTCSessionDescription(sdp_conf), function() {
				console.log('Correctly set remote description to RTCPeerConnectionScreen');
			}, function(error) {
				console.log('Error setting remote description to RTCPeerConnectionScreen: ' + error);
			});
		}else{
			var call_info = callsInfo[message.to];
			call_info.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp_conf), function() {
				console.log('Correctly set remote description to RTCPeerConnection');
			}, function(error) {
				console.log('Error setting remote description to RTCPeerConnection: ' + error);
			});
		}

	});



	// Ringing
	signallingSocket.on(RINGING, function(message) {
		console.log('<-- Received ringing: ' + JSON.stringify(message));
		if(!message.screen){
			setCallStateRinging(message.to);
		}else{
			setCallStateRingingScreen(message.to);
		}
	//                           // Play ringing tone
	//                           playRingingTone(message);
	});


	// Bye
	signallingSocket.on(BYE, function(message) {
		console.log('<- Received bye: ' + JSON.stringify(message));

		if(message.screen){
			var call_infoScreen = callsInfoScreen[message.from];
			if(typeof call_infoScreen != "undefined"){
				console.log("Getting callsInfoScreen from: "+message.from);
				console.log(callsInfoScreen);
				console.log(call_infoScreen);
				//var previous_state = call_infoScreen.callState;

				// Close peerConnection
				if (call_infoScreen.peerConnectionScreen)
					call_infoScreen.peerConnectionScreen.close();

				// Send ok response
				sendOk(message.from, message.to, currentGroupId, message.callId, message.transactionId, message.screen);

				// Remove remote video panel
				removeRemoteViewScreen(message.from);

				console.log(divRemoteViews);
				//Check if screen is in mainVIew
				if (userInMainRemoteView === message.from) {
					// User in main remote view has retired.
					// Attach first user in callsInfo object to main remote view.
					var first_remote_video_element = getFirstRemoteVideoElement();
					console.log(first_remote_video_element);
					if (!first_remote_video_element) {
						// There are note remote connections left.
						// Reattach local stream to main view.
						// dettachMediaStream(remoteVideo);  // ??
						reattachMediaStream(localVideo, localVideoSmall);
						localVideoSmall.style.opacity = 0;
						remoteVideo.style.opacity = 0;
						localVideo.style.opacity = 1;
						userInMainRemoteView = null;
						setMainVideoInfoText('');  // Remove information, since local user is shown.
					}
					else {
						console.log('Reattaching user ' + first_remote_video_element.getAttribute('userid') + ' to main remote view ' + first_remote_video_element);
						reattachMediaStream(remoteVideo, first_remote_video_element);
						userInMainRemoteView = first_remote_video_element.getAttribute('userid');
						setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
					}
				}

				// Remove call information from callsInfo

				console.log("Remove callsInfoScreen from: "+message.from+" in received BYE.");
			   	console.log(callsInfo);
				delete callsInfoScreen[message.from];
			}
		}else{
			var call_info = callsInfo[message.from];
			var previous_state = call_info.callState;

			setCallStateTerminating(message.from);

			// Close peerConnection
			if (call_info.peerConnection)
				call_info.peerConnection.close();

			// Send ok response
			console.log("sendok from: "+message.from+" to: "+message.to+" group: "+currentGroupId+" callId: "+message.callId+" screen: "+screen);
			sendOk(message.from, message.to, currentGroupId, message.callId, message.transactionId, message.screen);

			// Remove remote video panel
			removeRemoteView(message.from);
			if (userInMainRemoteView === message.from) {
				// User in main remote view has retired.
				// Attach first user in callsInfo object to main remote view.
				var first_remote_video_element = getFirstRemoteVideoElement();
				if (!first_remote_video_element) {
					// There are note remote connections left.
					// Reattach local stream to main view.
					// dettachMediaStream(remoteVideo);  // ??
					reattachMediaStream(localVideo, localVideoSmall);
					localVideoSmall.style.opacity = 0;
					remoteVideo.style.opacity = 0;
					localVideo.style.opacity = 1;
					userInMainRemoteView = null;
					setMainVideoInfoText('');  // Remove information, since local user is shown.
				}
				else {
					console.log('Reattaching user ' + first_remote_video_element.getAttribute('userid') + ' to main remote view ' + first_remote_video_element);
					reattachMediaStream(remoteVideo, first_remote_video_element);
					userInMainRemoteView = first_remote_video_element.getAttribute('userid');
					setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
				}
			}


			//                                           if (getObjectSize(callsInfo) === 0) {
			//                                                           // There are not remote connections left.
			//                                                           // Reattach local stream to main view.
			//                                                           // dettachMediaStream(remoteVideo);  // ??
			//                                                           reattachMediaStream(localVideo, localVideoSmall);
			//                                                           setTimeout(function() {
			//                                                                          localVideoSmall.style.opacity = 0;
			//                                                                          remote_video.style.opacity = 0;
			//                                                                          localVideo.style.opacity = 1;
			//                                                           }, 0);
			//                                                           userInMainRemoteView = null;
			//                                           }
			//                                           else {
			//                                                           if (userInMainRemoteView === message.from) {
			//                                                                          // User in main remote view has retired.
			//                                                                          // Attach first user in callsInfo object to main remote view.
			//                                                                          var first_remote_video_element = getFirstRemoteVideoElement();
			//                                                                          console.log('Reattaching user ' + Object.keys(callsInfo)[0] + ' to main remote view ' + first_remote_video_element);
			//                                                                          reattachMediaStream(remoteVideo, first_remote_video_element);
			//                                                           }
			//                                           }



			// Remove call information from callsInfo
			console.log("Remove callsInfo from: "+message.from+" in received BYE.");
		   	console.log(callsInfo);
			delete callsInfo[message.from];
		}
	});

	// Ok
	signallingSocket.on(OK, function(message) {
		console.log('<- Received ok: ' + JSON.stringify(message));
		var call_info = callsInfo[message.to];
		if (call_info.callState == STATE_RINGING)
			setCallStateEstablished(message.to);
		else if (call_info.callState == STATE_TERMINATING) {
		   setCallStateTerminated(message.to);
	//                         setCallStateIdle();
		   // Remove call info
		   console.log("Remove callsInfo from: "+message.to+" in received OK.");
		   console.log(callsInfo);
		   delete callsInfo[message.to];
		}
	});

//            // Busy
//            signallingSocket.on(BUSY, function(message) {
//                           console.log('<- Received busy: ' + JSON.stringify(message));
//                           if (callState == STATE_RINGING || callState == STATE_INITIATING) {
//                                           // Close peerConnection
//                                           if (peerConnection)
//                                                           peerConnection.close();
//
//                                           // Update call state
//                                           setCallStateIdle();
//
//                                           alert('User ' + message.to + ' is busy!');
//                           }
//            });


}

 

function playRingingTone(ringingMessage) {
	// TODO
}

 

/**
* Deregister user from registrar.
*/

function deregisterUserC() {
	//            // 0. Stop recordings if needed.
	//            if (recordingState == RECORDING_STATE_STARTED) {
	//                           stopRecordCurrentCall();
	//            }

	// 1. Release local media
	console.log('Detaching local media from localVideo');
	detachMediaStream(localVideo); // TODO



	// 2. Deregister user in registrar
	console.log('2. Deregister current user in signalling server');
	signallingSocket.emit('deregister', {
		userId: currentUserId,
		groupId: currentGroupId
	});

	//            // 2.1. Remove contacts
	//            refreshAllContacts(null);


	// 3. Close signalling channel
	// socket.disconnect();
}

 

/**
* Hang up current call with userid
*
* @param userid
*/

function hangUpCallCurrentCall(userid) {
	var call_info = callsInfo[userid];
	if (callState == STATE_ESTABLISHED) {
		console.log('!! Hanging up call');
		// Send bye
		sendBye(currentUserId, callParticipant, currentCallId, generateTransactionId(BYE));

		// Change state
		setCallStateTerminating(userid);

		// Close peerConnection
		call_info.peerConnection.close();
		//                           // Reset video panels
		//transitionToInactive();
	}
}

 

 

/**
*
* @param socket signalling socket.io
*/

function getAllContacts(socket) {
	var user_list = {};
	user_list.all = true;
	socket.emit('getUserInformation', user_list);
}

 

 

/**
* @param destinationUserid destination user to which peer connection is to be created
*        (within current group).
*       
*/
function createPeerConnection(destinationUserId) {
	try {
		console.log('Creating RTCPeerConnnection with:\n'
					+ '  peerConnectionConfiguration: \''
					+ JSON.stringify(peerConnectionConfiguration) + '\';\n'
					+ '  peerConnectionConstraints: \''
					+ JSON.stringify(peerConnectionConstraints) + '\'.');

		// Get call state information.
		var call_info = callsInfo[destinationUserId];

		console.log("[createPeerConnection] antes de añadirle callState y peer_connection a callInfo [destinationUserId]: " + JSON.stringify (callsInfo[destinationUserId]));

		// Init call state for current destination userid.
		call_info.callState = STATE_IDLE;

		// Create peer connection to current destination userid.
		var peer_connection = new RTCPeerConnection(peerConnectionConfiguration, peerConnectionConstraints);
		console.log('Created peerConnection: ' + peer_connection);  // Debug
		call_info.peerConnection = peer_connection;
		console.log("[createPeerConnection] después de añadirle callState y peer_connection a callInfo [destinationUserId]: " + JSON.stringify (callsInfo[destinationUserId]));
		peer_connection.onicecandidate = function(eventHandler) {
			if (call_info.callState == STATE_INITIATING
			|| call_info.callState == STATE_INITIATING_T
			|| call_info.callState == STATE_RINGING) {
			   // Send candidate to destinationUserid
			   sendIceCandidate(currentUserId, destinationUserId, currentGroupId,call_info.currentCallId, 
			   					generateTransactionId(ICE_CANDIDATE), eventHandler, false);
			}
		};
		console.log('Created RTCPeerConnnection with:\n'
					+ '  peerConnectionConfiguration: \''
					+ JSON.stringify(peerConnectionConfiguration) + '\';\n'
					+ '  peerConnectionConstraints: \''
					+ JSON.stringify(peerConnectionConstraints) + '\'.');
	} catch (e) {
		console.log('Failed to create PeerConnection, exception: ' + e.message);
		alert('Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.');
	}

	peer_connection.onaddstream = function(event) {
		console.log('!! OnAddStream: Remote stream added');
		// Create small remote video element in interface and attach remote media to it.
		createRemoteView(destinationUserId);
		var remote_video = getRemoteVideoElement(destinationUserId);
		//var remote_video = document.getElementById('remoteVideo');
		console.log('!! OnAddStream: RemoteVideo from Template ' + remoteVideo);
		//attachMediaStream(remoteVideo, event.stream);
		attachMediaStream(remote_video, event.stream);
		callsInfo[destinationUserId].remoteStream = event.stream;
		//                           waitForRemoteVideo(event.stream, getRemoteVideoElement(invite.from));

		setTimeout(function() {
				       remoteVideo.style.opacity = 1;
		}, 0);

		// If first remote connection, automatically focus.
		//                           if (getObjectSize(callsInfo) === 1) {
		if (userInMainRemoteView === null) {
			// First remote connection.
			// Attach to main remote view.
			attachMediaStream(remoteVideo, event.stream);
			reattachMediaStream(localVideoSmall, localVideo);
			setTimeout(function() {
						   localVideoSmall.style.opacity = 1;
						   remoteVideo.style.opacity = 1;
						   localVideo.style.opacity = 0;
			}, 0);
			userInMainRemoteView = destinationUserId;
			setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
		}

		//                           // Debug
		//                           reattachMediaStream(localVideoSmall, localVideo);
		//                           attachMediaStream(remoteVideo, event.stream);
		//
		//                           setTimeout(function() {
		//                                           divRemoteVideo.style.opacity = 1;
		//                                           remoteVideo.style.opacity = 1;
		//                           }, 0);
		//
		////                       remoteStream = event.stream;
		//                           waitForRemoteVideo(event.stream, remoteVideo);
		//                           //


		//                           reattachMediaStream(localVideoSmall, localVideo);
		//                           attachMediaStream(remoteVideo, event.stream);
		//                           remoteStream = event.stream;
		//                           waitForRemoteVideo();

	};

	peer_connection.onremovestream = function(event) {
		console.log('!! OnRemoveStream: Remote stream removed');
		// TODO
	};

	peer_connection.onnegotiationneeded = function() {
		console.log('!! OnNegotiationNeeded: creating local offer');
		peer_connection.createOffer(function(desc) {
			// Set Opus as the preferred codec in SDP if Opus is present.
			// TODO ???
			desc.sdp = preferOpus(desc.sdp);

			peer_connection.setLocalDescription(desc, function() {
			console.log('Create local description: ' + JSON.stringify(desc));
			// Send invite
			sendInvite(currentUserId, destinationUserId, currentGroupId,
						                  generateCallId(currentUserId, destinationUserId),
						                  generateTransactionId(INVITE),
						                  peer_connection.localDescription, false);
			// // Update call state
			// callState = STATE_INITIATING;
			}, logError);
		}, logError);
	}
	console.log("[createPeerConnection]final función callsInfo [destinationUserId] " + JSON.stringify (callsInfo[destinationUserId]));

	return peer_connection;

}


function createPeerConnectionScreen(destinationUserId){
	try {
		console.log('[Screen] Creating RTCPeerConnnectionScreen with:\n'
					+ '  peerConnectionConfiguration: \''
					+ JSON.stringify(peerConnectionConfiguration) + '\';\n'
					+ '  peerConnectionConstraints: \''
					+ JSON.stringify(peerConnectionConstraints) + '\'.');

		// Get call state information.
		var call_infoScreen = callsInfoScreen[destinationUserId];

		// Init call state for current destination userid.
		call_infoScreen.callStateScreen = STATE_IDLE;

		// Create peer connection to current destination userid.
		var peer_connection_screen = new RTCPeerConnection(peerConnectionConfiguration, peerConnectionConstraints);
		console.log('[Screen] Created peerConnectionScreen: ' + peer_connection_screen);  // Debug
		call_infoScreen.peerConnectionScreen = peer_connection_screen;
		console.log("user call_infoScreen: "+destinationUserId);
		console.log(call_infoScreen);           
		peer_connection_screen.onicecandidate = function(eventHandler) {
			if (call_infoScreen.callStateScreen == STATE_INITIATING
			|| call_infoScreen.callStateScreen == STATE_INITIATING_T
			|| call_infoScreen.callStateScreen == STATE_RINGING) {
			   // Send candidate to destinationUserid
			   sendIceCandidate(currentUserId, destinationUserId, currentGroupId,call_infoScreen.currentCallId, 
			   					generateTransactionId(ICE_CANDIDATE), eventHandler, true);
			}
		};
		console.log('[Screen] Created RTCPeerConnnectionScreen with:\n'
					+ '  peerConnectionConfiguration: \''
					+ JSON.stringify(peerConnectionConfiguration) + '\';\n'
					+ '  peerConnectionConstraints: \''
					+ JSON.stringify(peerConnectionConstraints) + '\'.');
	} catch (e) {
		console.log('Failed to create PeerConnectionScreen, exception: ' + e.message);
		alert('[Screen] Cannot create RTCPeerConnectionScreen object; WebRTC is not supported by this browser.');
	}

	peer_connection_screen.onaddstream = function(event) {
		console.log('!! [Screen] OnAddStream: Remote stream added');
		// Create small remote desktop element in interface and attach remote media to it.
		//createRemoteView(destinationUserId);
		var remote_video = getRemoteVideoElement(destinationUserId);
		//attachMediaStream(remote_video, event.stream);
		callsInfoScreen[destinationUserId].remoteScreenStream = event.stream;
		//waitForRemoteVideo(event.stream, getRemoteVideoElement(invite.from));

		setTimeout(function() {
			remote_video.style.opacity = 1;
		}, 0);

		// If first remote connection, automatically focus.
		//                           if (getObjectSize(callsInfo) === 1) {
		//if (userInMainRemoteView === null) {
			// First remote connection.
			// Attach to main remote view.
			//attachMediaStream(remoteVideo, event.stream);
			//reattachMediaStream(localVideoSmall, localVideo);
			/*setTimeout(function() {
				localVideoSmall.style.opacity = 1;
				remoteVideo.style.opacity = 1;
				localVideo.style.opacity = 0;
			}, 0);
			userInMainRemoteView = destinationUserId;
			setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information*/
		//}

		//                           // Debug
		//                           reattachMediaStream(localVideoSmall, localVideo);
		//                           attachMediaStream(remoteVideo, event.stream);
		//
		//                           setTimeout(function() {
		//                                           divRemoteVideo.style.opacity = 1;
		//                                           remoteVideo.style.opacity = 1;
		//                           }, 0);
		//
		////                       remoteStream = event.stream;
		//                           waitForRemoteVideo(event.stream, remoteVideo);
		//                           //


		//                           reattachMediaStream(localVideoSmall, localVideo);
		//                           attachMediaStream(remoteVideo, event.stream);
		//                           remoteStream = event.stream;
		//                           waitForRemoteVideo();

	};

	peer_connection_screen.onremovestream = function(event) {
		console.log('!! [Screen] OnRemoveStream: Remote stream removed');
		// TODO
	};

	peer_connection_screen.onnegotiationneeded = function() {
		console.log('!! [Screen] OnNegotiationNeeded: creating local offer Screen');
		peer_connection_screen.createOffer(function(desc) {
			// Set Opus as the preferred codec in SDP if Opus is present.
			// TODO ???
			desc.sdp = preferOpus(desc.sdp);

			peer_connection_screen.setLocalDescription(desc, function() {
			console.log('[Screen] Create local description: ' + JSON.stringify(desc));
			
			// Send invite
			sendInvite(currentUserId, destinationUserId, currentGroupId, generateCallScreenId(currentUserId, destinationUserId),
						generateTransactionId(INVITE),
						peer_connection_screen.localDescription, true);
			// // Update call state
			// callState = STATE_INITIATING;
			}, logError);
		}, logError);
	}

	return peer_connection_screen;
}

 

/**
*
* @param error
*/
function logError(error) {
	console.log(error.name + ": " + error.message);
}

 

 

/**
*
* @param from
* @param to
* @param group
* @param callId
* @param transactionId
* @param sdp
* @param screen
*/
function sendInvite(from, to, group, callId, transactionId, sdp, screen) {
	if(!screen){
		setCallStateInitiating(to);
	}else{
		setCallStateInitiatingScreen(to);
	}
	var invite_msg = {
		from: from,
		to: to,
		group: group,
		callId : callId,
		transactionId : generateTransactionId(INVITE),
		sdp : sdp,
		screen: screen
	};
	currentCallId = invite_msg.callId;
	currentTransactionId = invite_msg.transactionId;
	console.log('Initiating call: ' + from + ' -> ' + to);
	console.log('-> Sending invite: ' + JSON.stringify(invite_msg));
	signallingSocket.emit(INVITE, invite_msg);

	lastInviteMessage = invite_msg;
	callParticipant = to;
}

 

 

/**
*
* @param from
* @param to
* @param callId
* @param transactionId
* @param eventHandler
*            according interface RTCPeerConnectionIceEvent dictionary
*            RTCPeerConnectionIceEventInit : EventInit { RTCIceCandidate
*            candidate; }; dictionary RTCIceCandidateInit { DOMString
*            candidate; DOMString sdpMid; unsigned short sdpMLineIndex; };
*/
function sendIceCandidate(from, to, group, callId, transactionId, eventHandler, screen) {
	if (eventHandler.candidate) {
		var msg = {
			from : from,
			to : to,
			group: group,
			callId : callId,
			transactionId : transactionId,
			iceCandidate : {
				label : eventHandler.candidate.sdpMLineIndex,
				id : eventHandler.candidate.sdpMid,
				candidate : eventHandler.candidate.candidate
			},
			screen: screen
		};
		
		if(!screen){
			var call_info = callsInfo[to];
			//                           call_info.callId = msg.callId;
			call_info.currentTransactionId = msg.transactionId;
		}else{
			var call_infoScreen = callsInfoScreen[to];
			//                           call_info.callId = msg.callId;
			call_infoScreen.currentTransactionId = msg.transactionId;
		}
		console.log('-> Sending iceCandidate: ' + JSON.stringify(msg));
		signallingSocket.emit(ICE_CANDIDATE, msg);
	} else {
		console.log('End of ICE candidates');
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
function sendRinging(from, to, group, callId, transactionId, screen) {
	if(!screen){
		setCallStateRinging(from);
	}else{
		setCallStateRingingScreen(from);
	}
	var msg = {
		           from: from,
		           to: to,
		           group: group,
		           callId: callId,
		           transactionId: transactionId,
		           screen:screen
	};
	console.log('-> Sending ringing: ' + JSON.stringify(msg));
	signallingSocket.emit(RINGING, msg);
}

 

/**
*
* @param from
* @param to
* @param group
* @param callId
* @param transactionId
*/
function sendBye(from, to, group, callId, transactionId) {
	setCallStateTerminating(to);
	var bye_msg = {
		           from : from,
		           to : to,
		           group: group,
		           callId : callId,
		           transactionId : transactionId
	};
	var call_info = callsInfo[to];
	call_info.currentTransactionId = bye_msg.transactionId;
	console.log('-> Sending bye: ' + JSON.stringify(bye_msg));
	signallingSocket.emit(BYE, bye_msg);
}

 

 

/**
*
* @param from
* @param to
* @group group
* @param callId
* @param transactionId
*/
function sendOk(from, to, group, callId, transactionId, screen) {
	var ok_msg = {
		           from : from,
		           to : to,
		           group: group,
		           callId : callId,
		           transactionId : transactionId,
		           screen: screen
	};
	
	if(screen){
		var call_infoScreen = callsInfoScreen[from];
		call_infoScreen.currentTransactionId = ok_msg.transactionId;	
	}else{
		var call_info = callsInfo[from];
		call_info.currentTransactionId = ok_msg.transactionId;
	}
	console.log('-> Sending ok: ' + JSON.stringify(ok_msg));
	signallingSocket.emit(OK, ok_msg);
}

 

 

///**

// *

// * @param from

// * @param to

// * @param callId

// * @param transactionId

// */

//function sendBusy(from, to, callId, transactionId) {

//            var busy_msg = {

//                           from : from,

//                           to : to,

//                           callId : callId,

//                           transactionId : transactionId

//            };

//            currentTransactionId = busy_msg.transactionId;

//            console.log('-> Sending busy: ' + JSON.stringify(busy_msg));

//            signallingSocket.emit(BUSY, busy_msg);

//}

 

 

/**
*
* @param from
* @param to
* @param callId
* @param transactionId
*/
function sendDecline(from, to, group, callId, transactionId) {
	var decline_msg = {
		           from : from,
		           to : to,
		           group: group,
		           callId : callId,
		           transactionId : transactionId
	};
	var call_info = callsInfo[from];
	call_info.currentTransactionId = ok_msg.transactionId;
	console.log('-> Sending decline: ' + JSON.stringify(decline_msg));
	signallingSocket.emit(DECLINE, ok_msg);
}

 

 

/**
* Request all contacts information from register.
*
* @param socket
*/
function getAllContacts(socket) {
	var user_list = {};
	user_list.all = true;
	socket.emit('getUserInformation', user_list);
}

 

 

/**
*
* @returns
*/
function getRandomInteger() {
	return Math.floor((Math.random() * 10000000000) + 1);
}

 

 

/**
*
* @returns
*/
function getTimestamp() {
	return new Date().getTime();
}

 

 

/**
*
* @param operation
* @returns {String}
*/
function generateTransactionId(operation) {
	return operation + '-' + getTimestamp() + '-' + getRandomInteger();
}

 

 

/**
*
* @param originUserid
* @param destinationUserid
* @returns {String}
*/
function generateCallId(originUserid, destinationUserid) {
	return originUserid + '-' + destinationUserid + '-' + getTimestamp() + '-'+ getRandomInteger();
}

/**

*
* @param originUserid
* @param destinationUserid
* @returns {String}
*/
function generateCallScreenId(originUserid, destinationUserid) {
	return originUserid + '-' + destinationUserid + '-screen' + '-' + getTimestamp() + '-'+ getRandomInteger();
}

 

 

/**
* Make a call to userid
*
* @param destinationUserid
* @return callid
*/
function initiateCall(destinationUserid) {
	// ORIGINATING
	console.log('Initiating call: ' + currentUserId + ' -> '+ destinationUserid);

	// Create peer connection for destinationUserid
	console.log('InitiateCall. 1. Creating Peer Connection');

	// Create call info
	call_info = callsInfo[destinationUserid];
	//console.log("call_info!!!initiateCall");
	//console.log(call_info);
    if(typeof call_info == "undefined"){
    	var call_info = {};
    	callsInfo[destinationUserid] = call_info;
    }
	/*var call_info = {};
	callsInfo[destinationUserid] = call_info;*/
	call_info.callState = STATE_IDLE;
	console.log("[initiateCall] Call Info ANTES de crear el peer para el usuario "+destinationUserid+": " + JSON.stringify(callsInfo[destinationUserid]));
	createPeerConnection(destinationUserid);
	console.log("[initiateCall] Call state DESPUÉS de crear el peer para el usuario "+destinationUserid+": " + JSON.stringify(callsInfo[destinationUserid]));
	// Add local media stream
	console.log('InitiateCall. 2. Adding local media stream');
	console.log('call_info: '+ JSON.stringify(call_info));
	console.log('call_info.peerConnection: ' + JSON.stringify(call_info.peerConnection));
	console.log('call_info.peerConnection.addStream : ' + JSON.stringify(call_info.peerConnection.addStream));
	call_info.peerConnection.addStream(localMediaStream);

}


/**
*	Initiate callScreen with an user
*/
function initiateCallScreen(destinationUserid){
	// ORIGINATING
    console.log('Initiating call-screen: ' + currentUserId + ' -> '+ destinationUserid);

    // Create peer connection for destinationUserid
    console.log('InitiateCallScreen. 1. Creating Peer Connection');

   

    // Update call info
    call_infoScreen = callsInfoScreen[destinationUserid];
    //console.log("call_info!!!initiateCallScreen");
	//console.log(call_info);
    if(typeof call_infoScreen == "undefined"){
    	var call_infoScreen = {};
    	callsInfoScreen[destinationUserid] = call_infoScreen;
    }
    call_infoScreen.callStateScreen = STATE_IDLE;
    //call_info.callState = STATE_IDLE; ??
	console.log("-- CALL INFO --");
	console.log(call_infoScreen);
	console.log("---------------");

    createPeerConnectionScreen(destinationUserid);

    // Add local media stream
    console.log('InitiateCallScreen. 2. Adding local media stream');
    call_infoScreen.peerConnectionScreen.addStream(localScreenStream);
}

 

 

/**
*
* @param invite invite message received from a remote caller.
*/

/*function createRTCPeerConnectionTerminating(invite) {
	var call_info = callsInfo[invite.from];
	try {
		console.log('Creating RTCPeerConnnection (terminating) with:\n'
					+ '  peerConnectionConfiguration: \''
					+ JSON.stringify(peerConnectionConfiguration) + '\';\n'
					+ '  peerConnectionConstraints: \''
					+ JSON.stringify(peerConnectionConstraints) + '\'.');
		var peer_connection = new RTCPeerConnection(peerConnectionConfiguration, peerConnectionConstraints);
		call_info.peerConnection = peer_connection;
		peer_connection.onicecandidate = function(eventHandler) {
			console.log('!! OnIceCandidate');
			// Send candidate to caller (invert to and from in received invite)
			sendIceCandidate(invite.to, invite.from, currentGroupId, invite.callId, generateTransactionId(ICE_CANDIDATE), eventHandler, false);
		};

		peer_connection.setRemoteDescription(new RTCSessionDescription(invite.sdp), function() {
			console.log('Correctly set remote description to RTCPeerConnection. Creating answer with constraints: '
						                                  + JSON.stringify(sdpConstraints));
			peer_connection.createAnswer( function(sdp) {
				  // Set Opus as the preferred
				  // codec in SDP if Opus is
				  // present.
				  // TODO ???
				  sdp.sdp = preferOpus(sdp.sdp);

				  // Success callback
				  console.log('Setting local description: ' + JSON.stringify(sdp));
				  peer_connection.setLocalDescription(sdp);
				  console.log('Sending sessionProgress response (183) to caller');
				  sendSessionProgress(invite.from, invite.to, currentGroupId, invite.callId, invite.transactionId, sdp, false);
			}, function(error) {
				// Error callback
				console.log('Error creating answer to caller session description: ' + error);
			}, sdpConstraints);
		}, function(error) {
			console.log('Error setting remote description to RTCPeerConnection: ' + error);
		});
	} catch (e) {
		console.log('Failed to create PeerConnection, exception: ' + e.message);
		alert('Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.');
	}
     
	call_info.peerConnection.onaddstream = function(event) {
		console.log('!! OnAddStream: Remote stream added');

		// Attach remote desktop to the corresponding video element.
		createRemoteView(invite.from);
		var remote_video = getRemoteVideoElement(invite.from);
		attachMediaStream(remote_video, event.stream);
		call_info.remoteStream = event.stream;

		setTimeout(function() {
			remote_video.style.opacity = 1;
		}, 0);

		// If first remote connection, automatically focus.
		//if (getObjectSize(callsInfo) === 1) {
		if (userInMainRemoteView === null) {
			// First remote connection.
			// Attach to main remote view.
			attachMediaStream(remoteVideo, event.stream);
			reattachMediaStream(localVideoSmall, localVideo);
			setTimeout(function() {
				localVideoSmall.style.opacity = 1;
				remoteVideo.style.opacity = 1;
				localVideo.style.opacity = 0;
			}, 0);
			userInMainRemoteView = invite.from;
			setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
		}

		//reattachMediaStream(localVideoSmall, localVideo);
		//attachMediaStream(remoteVideo, event.stream);

		//waitForRemoteVideo(event.stream, getRemoteVideoElement(invite.from));
	};

	call_info.peerConnection.onremovestream = function(event) {
		console.log('!! OnRemoveStream: Remote stream removed');
		// TODO
	};

	call_info.peerConnection.onnegotiationneeded = function() {
		console.log('onnegotiationneeded (terminating)');
		// TODO
	}
        
	return call_info.peerConnection;
}*/


/**
*
* @param invite invite message received from a remote caller.
*/
function createRTCPeerConnectionTerminating(invite) {
	var call_info = callsInfo[invite.from];
	try {
		console.log('Creating RTCPeerConnnection (terminating) with:\n'
					+ '  peerConnectionConfiguration: \''
					+ JSON.stringify(peerConnectionConfiguration) + '\';\n'
					+ '  peerConnectionConstraints: \''
					+ JSON.stringify(peerConnectionConstraints) + '\'.');
		var peer_connection = new RTCPeerConnection(peerConnectionConfiguration, peerConnectionConstraints);
		
		call_info.peerConnection = peer_connection;
		
		peer_connection.onicecandidate = function(eventHandler) {
			console.log('!! OnIceCandidate');
			// Send candidate to caller (invert to and from in received invite)
			sendIceCandidate(invite.to, invite.from, currentGroupId, invite.callId, generateTransactionId(ICE_CANDIDATE), eventHandler, invite.screen);
		};

		peer_connection.setRemoteDescription(new RTCSessionDescription(invite.sdp), function() {
			console.log('Correctly set remote description to RTCPeerConnection. Creating answer with constraints: '
						                                  + JSON.stringify(sdpConstraints));
			peer_connection.createAnswer( function(sdp) {
				  // Set Opus as the preferred
				  // codec in SDP if Opus is
				  // present.
				  // TODO ???
				  sdp.sdp = preferOpus(sdp.sdp);

				  // Success callback
				  console.log('Setting local description: ' + JSON.stringify(sdp));
				  peer_connection.setLocalDescription(sdp);
				  console.log('Sending sessionProgress response (183) to caller');
				  sendSessionProgress(invite.from, invite.to, currentGroupId, invite.callId, invite.transactionId, sdp, invite.screen);
			}, function(error) {
				// Error callback
				console.log('Error creating answer to caller session description: ' + error);
			}, sdpConstraints);
		}, function(error) {
			console.log('Error setting remote description to RTCPeerConnection: ' + error);
		});
	} catch (e) {
		console.log('Failed to create PeerConnection, exception: ' + e.message);
		alert('Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.');
	}
     
	call_info.peerConnection.onaddstream = function(event) {
		console.log('!! OnAddStream: Remote stream added');

		// Attach remote desktop to the corresponding video element.
		
		
		createRemoteView(invite.from);
		call_info.remoteScreen = event.stream;
		
		
		var remote_video = getRemoteVideoElement(invite.from);
		attachMediaStream(remote_video, event.stream);
		
		
		setTimeout(function() {
			remote_video.style.opacity = 1;
		}, 0);

		// If first remote connection, automatically focus.
		//if (getObjectSize(callsInfo) === 1) {
		if (userInMainRemoteView === null) {
			// First remote connection.
			// Attach to main remote view.
			attachMediaStream(remoteVideo, event.stream);
			reattachMediaStream(localVideoSmall, localVideo);
			setTimeout(function() {
				localVideoSmall.style.opacity = 1;
				remoteVideo.style.opacity = 1;
				localVideo.style.opacity = 0;
			}, 0);
			userInMainRemoteView = invite.from;
			setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
		}

		//reattachMediaStream(localVideoSmall, localVideo);
		//attachMediaStream(remoteVideo, event.stream);

		//waitForRemoteVideo(event.stream, getRemoteVideoElement(invite.from));
	};

	call_info.peerConnection.onremovestream = function(event) {
		console.log('!! OnRemoveStream: Remote stream removed');
		// TODO
	};

	call_info.peerConnection.onnegotiationneeded = function() {
		console.log('onnegotiationneeded (terminating)');
		// TODO
	}
        
	return call_info.peerConnection;
}
 
 
/**
*
* @param invite invite message received from a remote caller.
*/
function createRTCPeerConnectionTerminatingScreen(invite) {
	var call_infoScreen = callsInfoScreen[invite.from];
	try {
		console.log('Creating RTCPeerConnnection (terminating) with:\n'
					+ '  peerConnectionConfiguration: \''
					+ JSON.stringify(peerConnectionConfiguration) + '\';\n'
					+ '  peerConnectionConstraints: \''
					+ JSON.stringify(peerConnectionConstraints) + '\'.');
		var peer_connection = new RTCPeerConnection(peerConnectionConfiguration, peerConnectionConstraints);
		
		call_infoScreen.peerConnectionScreen = peer_connection;
		
		peer_connection.onicecandidate = function(eventHandler) {
			console.log('!! OnIceCandidate');
			// Send candidate to caller (invert to and from in received invite)
			sendIceCandidate(invite.to, invite.from, currentGroupId, invite.callId, generateTransactionId(ICE_CANDIDATE), eventHandler, invite.screen);
		};

		peer_connection.setRemoteDescription(new RTCSessionDescription(invite.sdp), function() {
			console.log('Correctly set remote description to RTCPeerConnection. Creating answer with constraints: '
						                                  + JSON.stringify(sdpConstraints));
			peer_connection.createAnswer( function(sdp) {
				  // Set Opus as the preferred
				  // codec in SDP if Opus is
				  // present.
				  // TODO ???
				  sdp.sdp = preferOpus(sdp.sdp);

				  // Success callback
				  console.log('Setting local description: ' + JSON.stringify(sdp));
				  peer_connection.setLocalDescription(sdp);
				  console.log('Sending sessionProgress response (183) to caller');
				  sendSessionProgress(invite.from, invite.to, currentGroupId, invite.callId, invite.transactionId, sdp, invite.screen);
			}, function(error) {
				// Error callback
				console.log('Error creating answer to caller session description: ' + error);
			}, sdpConstraints);
		}, function(error) {
			console.log('Error setting remote description to RTCPeerConnection: ' + error);
		});
	} catch (e) {
		console.log('Failed to create PeerConnection, exception: ' + e.message);
		alert('Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.');
	}
     
	call_infoScreen.peerConnectionScreen.onaddstream = function(event) {
		console.log('!![Screen] OnAddStream: Remote stream added');

		// Attach remote desktop to the corresponding video element.
		
		createRemoteScreenView(invite.from);
		call_infoScreen.remoteScreen = event.stream;
		
		var remote_screen_small = document.getElementById('remoteScreen' + invite.from);
		//console.log('remoteScreen' + invite.from);
		//console.log(remote_screen_small);
		/*attachMediaStream(remote_screen_small, event.stream);
		
		
		setTimeout(function() {
			remote_screen_small.style.opacity = 1;
		}, 0);*/

		// If first remote connection, automatically focus.
		//if (getObjectSize(callsInfo) === 1) {
		/*if (userInMainRemoteView === null) {
			// First remote connection.
			// Attach to main remote view.
			//attachMediaStream(remoteVideo, event.stream);
			//reattachMediaStream(localVideoSmall, localVideo);
			setTimeout(function() {
				localVideoSmall.style.opacity = 1;
				remoteVideo.style.opacity = 1;
				localVideo.style.opacity = 0;
			}, 0);
			userInMainRemoteView = invite.from;
			setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
		}*/

		//reattachMediaStream(localVideoSmall, localVideo);
		//attachMediaStream(remoteVideo, event.stream);

		//waitForRemoteVideo(event.stream, getRemoteVideoElement(invite.from));
	};

	call_infoScreen.peerConnectionScreen.onremovestream = function(event) {
		console.log('!! OnRemoveStream: Remote stream removed');
		// TODO
	};

	call_infoScreen.peerConnectionScreen.onnegotiationneeded = function() {
		console.log('onnegotiationneeded (terminating)');
		// TODO
	}
        
	return call_infoScreen.peerConnectionScreen;
}
 

//- GUI manipulation -----------------------------------------------------

// TODO waitForRemoteVideo, transitionToActive, transitionToInactive

 

//function waitForRemoteVideo() {

//            // Call the getVideoTracks method via adapter.js.

//            videoTracks = remoteStream.getVideoTracks();

//            if (videoTracks.length === 0 || remoteVideo.currentTime > 0) {

//                           transitionToActive();

//            } else {

//                           setTimeout(waitForRemoteVideo, 100);

//            }

//}

 

function waitForRemoteVideo(remoteStream, remoteVideoElement) {
	// Call the getVideoTracks method via adapter.js.
	var video_tracks = remoteStream.getVideoTracks();
	if (video_tracks.length === 0 || remoteVideoElement.currentTime > 0) {
		transitionToActive(remoteVideoElement);
	} else {
		setTimeout(function () { waitForRemoteVideo(remoteStream, remoteVideoElement) }, 100);
	}
}

 

//function transitionToActive() {

//            // // localVideo.style.opacity = 0;

//            // // localVideoSmall.style.opacity = 0;

//            // // divVideoPanel.style.webkitTransform = 'rotateY(180deg)';

//            // setTimeout(function() { localVideo.src = ''; remoteVideo.style.opacity =

//            // 1; }, 0);

//            // setTimeout(function() { localVideo.src = ''; localVideo.style.opacity =

//            // 0; }, 500);

//            // setTimeout(function() { localVideoSmall.style.opacity = 1; }, 1000);

//

//            setTimeout(function() {

//                           divRemoteVideo.style.opacity = 1;

//                           remoteVideo.style.opacity = 1;

//            }, 0);

//            setTimeout(function() {

//                           localVideo.src = '';

//                           divLocalVideo.style.opacity = 0;

//                           localVideo.style.opacity = 0;

//            }, 500);

//            setTimeout(function() {

//                           divLocalVideoSmall.style.opacity = 1;

//                           localVideoSmall.style.opacity = 1;

//            }, 1000);

//}

 

function transitionToActive(remoteVideoElement) {
	setTimeout(function() { remoteVideoElement.style.opacity = 1; }, 0);
}

 

 

function transitionToInactive() {
	reattachMediaStream(localVideo, localVideoSmall);
	setTimeout(function() {
		divRemoteVideo.style.opacity = 1;
		remoteVideo.style.opacity = 0;
	}, 0);

	setTimeout(function() {
		divLocalVideo.style.opacity = 1;
		localVideo.style.opacity = 1;
	}, 0);

	setTimeout(function() {
		divLocalVideoSmall.style.src = '';
		divLocalVideoSmall.style.opacity = 0;
		localVideoSmall.style.opacity = 0;
	}, 0);

}

 

 

/**
* Create the remote view for a given user.
*
* @param userid
*/
function createRemoteView(userid, userName) {
	console.log('Creating remote view for user ' + userid);  // Debug


	var div_remote_video_element = document.createElement('DIV');
	div_remote_video_element.setAttribute('id', 'divRemoteVideo' + userid+'_1');
	div_remote_video_element.setAttribute('class', 'divRemoteVideoSmall');
	div_remote_video_element.setAttribute('class', 'videoRemote');
	div_remote_video_element.setAttribute('userid', userid);
	if (userName) {
		           div_remote_video_element.setAttribute('userName', userName);
	}
	div_remote_video_element.setAttribute('style','position:relative;');

	var remote_video_element = document.createElement('VIDEO');
	remote_video_element.setAttribute('id', 'remoteVideo' + userid);
	remote_video_element.setAttribute('class', 'remoteVideoSmall');
	remote_video_element.setAttribute('autoplay', 'autoplay');
	remote_video_element.setAttribute('userid', userid);
	if (userName) {
		           remote_video_element.setAttribute('userName', userName);
	}


	var text = userid;
	if (userName) {
		           text = userName;
	}
	//var text_remote_video_element = document.createTextNode(text);
	
	var span_button_icon = document.createElement("span"); 
	span_button_icon.setAttribute('class','icon-remote-view');

	var button_focus_remote_video_element = document.createElement('BUTTON');
	button_focus_remote_video_element.setAttribute('id', 'buttonFocusRemoteVideo' + userid);
	button_focus_remote_video_element.setAttribute('class', 'buttonFocusRemoteVideo');
	button_focus_remote_video_element.value = 'Focus';
	button_focus_remote_video_element.setAttribute('userid', userid);
	button_focus_remote_video_element.innerHTML = userid;
	
	if (userName) {
		button_focus_remote_video_element.setAttribute('userName', userName);
	}

	button_focus_remote_video_element.addEventListener('click', function() {
		// Attach current video to the main remote video view.
		// Attach to main remote view.
		reattachMediaStream(remoteVideo, remote_video_element);
		//                           setTimeout(function() {
		//                                           localVideoSmall.style.opacity = 1;
		//                                           remoteVideo.style.opacity = 1;
		//                                           localVideo.style.opacity = 0;
		//                           }, 0);
		userInMainRemoteView = userid;
		setMainVideoInfoText(userid);  // TODO Add more information
	});
	button_focus_remote_video_element.appendChild(span_button_icon);
	
	/*div_remote_video_element.addEventListener('dblclick', function(){
		reattachMediaStream(remoteVideo, remote_video_element);
		userInMainRemoteView = userid;
		setMainVideoInfoText(userid);
	});*/

	//div_remote_video_element.appendChild(text_remote_video_element);
	div_remote_video_element.appendChild(remote_video_element);
	div_remote_video_element.appendChild(button_focus_remote_video_element);


	//divRemoteViews.appendChild(div_remote_video_element);
	insertDivAlphabetically('divRemoteViews', div_remote_video_element);

	//orderDivsAlphabeticallyByID();

	//            var html_code = '<div id="divRemoteVideo' + userid + '" class="divRemoteVideoSmall">';
	//            html_code += '<video id="remoteVideo' + userid + '" class="remoteVideoSmall" autoplay="autoplay"></video>';
	//            html_code += '<button id="buttonFocusRemoteVideo' + userid + '" class="buttonFocusRemoteVideo">Focus</button></div>';


	//            console.log('divRemoteViews: ' + divRemoteViews);  // Debug
	//            divRemoteViews.appendChild(html_code);

}

 
function createRemoteScreenView(userid){
	console.log("Create remote screen view");
	
	var div_remote_video_element = document.createElement('DIV');
	div_remote_video_element.setAttribute('id', 'divRemoteVideo' + userid+'_2');
	div_remote_video_element.setAttribute('class', 'divRemoteScreenButton');
	div_remote_video_element.setAttribute('class', 'videoRemote');
	div_remote_video_element.setAttribute('userid', userid);
	/*if (userName) {
		           div_remote_video_element.setAttribute('userName', userName);
	}*/
	div_remote_video_element.setAttribute('style','position:relative;');
	
	var span_button_screen_icon = document.createElement("span"); 
	span_button_screen_icon.setAttribute('class','icon-share-desktop');
	
	var button_focus_remote_screen_element = document.createElement('BUTTON');
	button_focus_remote_screen_element.setAttribute('id', 'buttonFocusRemoteVideo' + userid);
	button_focus_remote_screen_element.setAttribute('class', 'buttonFocusRemoteVideo');
	button_focus_remote_screen_element.value = 'Focus';
	button_focus_remote_screen_element.setAttribute('userid', userid);
	button_focus_remote_screen_element.innerHTML = userid+' desktop';
	
	/*if (userName) {
		button_focus_remote_video_element.setAttribute('userName', userName);
	}*/
	
	button_focus_remote_screen_element.addEventListener('click', function() {
		
		var call_infoScreen = callsInfoScreen[userid];
		var stream = call_infoScreen.remoteScreen;
		
		attachMediaStream(remoteVideo, stream);
		
		userInMainRemoteView = userid;
		setMainVideoInfoText(userid);  // TODO Add more information
	});
	button_focus_remote_screen_element.appendChild(span_button_screen_icon);
	
	
	div_remote_video_element.appendChild(button_focus_remote_screen_element);
	//divRemoteViews.appendChild(div_remote_video_element);
	insertDivAlphabetically('divRemoteViews', div_remote_video_element);
	
	//orderDivsAlphabeticallyByID();
}
 

 

 

/**
* Returns the remote video element corresponding to a given user.
*
* @param userid
*/

function getRemoteVideoElement(userid) {
	//return document.getElementById('remoteVideo');
	return document.getElementById('remoteVideo' + userid);
}
/*function getRemoteVideoElement(userid) {
	return document.getElementById('remoteVideo' + userid);
}*/

 

 

/**
*
* @returns The first remote video element present or null if none exists.
*/
function getFirstRemoteVideoElement() {
	console.log("Get first remote video element");
	if (!divRemoteViews.hasChildNodes()) {
		return null;
	}
	var div_remote_video_list = divRemoteViews.getElementsByClassName('videoRemote');
	if (!div_remote_video_list || div_remote_video_list.length === 0) {
		return null;
	}             
	var div_remote_video = div_remote_video_list[0];
	console.log('div_remote_video: ' + div_remote_video);  // Debug
	var remote_video_list = div_remote_video.getElementsByClassName('remoteVideoSmall');
	if (!remote_video_list || remote_video_list.length === 0) {
		return null;
	}
	
	return remote_video_list[0];
}

 

 

/**
* Removes a given user's remote view.
*
* @param userid
*/
function removeRemoteView(userid) {
	console.log('Removing remote view for user ' + userid);  // Debug
	var div_remote_video = document.getElementById('divRemoteVideo' + userid + '_1');
	if (div_remote_video) {
		div_remote_video.remove();
	}
}

/**
* Removes a given user's remote screen view.
*
* @param userid
*/
function removeRemoteViewScreen(userid) {
	console.log('Removing remote view screen for user ' + userid);  // Debug
	var div_remote_video_screen = document.getElementById('divRemoteVideo' + userid + '_2');
	if (div_remote_video_screen) {
		div_remote_video_screen.remove();
	}
}

 

//------------------------------------------------------------------------

 

 

/**
*
* @param from
* @param to
* @param group
* @param callId
* @param transactionId
* @param sessionDescription
*            object of type RTCSessionDescription
*/

function sendSessionProgress(from, to, group, callId, transactionId, sessionDescription, screen) {
	msg = {
		from: from,
		to: to,
		group: group,
		callId: callId,
		transactionId: transactionId,
		sdp: sessionDescription.sdp,
		screen: screen
	};
	console.log('--> Sending sessionProgress response ' + to + ' -> ' + from+ ': ' + JSON.stringify(msg));
	signallingSocket.emit(SESSION_PROGRESS, msg);
}

 

 

// --------------- Call state transitions -------------------------------

function setCallStateIdle(userid) {
	var call_info = callsInfo[userid];
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_IDLE);
	call_info.callState = STATE_IDLE;
	call_info.callId = null;
	call_info.peerConnection = null;
}

 

function setCallStateInitiating(userid) {
	var call_info = callsInfo[userid];
	console.log('callsInfo: ' + JSON.stringify(callsInfo));  // Debug
	console.log('userid: ' + userid);  // Debug
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_INITIATING);
	call_info.callState = STATE_INITIATING;
}

function setCallStateInitiatingScreen(userid) {
	var call_infoScreen = callsInfoScreen[userid];
	console.log('callsInfoScreen: ' + JSON.stringify(callsInfoScreen));  // Debug
	console.log('userid: ' + userid);  // Debug
	console.log('STATE TRANSITION for call screen with ' + userid + ': ' + call_infoScreen.callState + ' -> ' + STATE_INITIATING);
	call_infoScreen.callStateScreen = STATE_INITIATING;
}


 

function setCallStateInitiatingT(userid) {
	var call_info = callsInfo[userid];
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_INITIATING_T);
	call_info.callState = STATE_INITIATING_T;
}

function setCallStateInitiatingTScreen(userid) {
	var call_infoScreen = callsInfoScreen[userid];
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_infoScreen.callState + ' -> ' + STATE_INITIATING_T);
	call_infoScreen.callStateScreen = STATE_INITIATING_T;
}

 

function setCallStateRinging(userid) {
	var call_info = callsInfo[userid];
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_RINGING);
	call_info.callState = STATE_RINGING;
}

function setCallStateRingingScreen(userid) {
	var call_infoScreen = callsInfoScreen[userid];
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_infoScreen.callState + ' -> ' + STATE_RINGING);
	call_infoScreen.callStateScreen = STATE_RINGING;
}


function setCallStateEstablished(userid) {
	var call_info = callsInfo[userid];
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_ESTABLISHED);
	call_info.callState = STATE_ESTABLISHED;
}

function setCallStateEstablishedScreen(userid) {
	var call_infoScreen = callsInfoScreen[userid];
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_infoScreen.callState + ' -> ' + STATE_ESTABLISHED);
	call_infoScreen.callStateScreen = STATE_ESTABLISHED;
}

 

function setCallStateTerminating(userid) {
	var call_info = callsInfo[userid];
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_TERMINATING);
	call_info.callState = STATE_TERMINATING;
}

 

function setCallStateTerminated(userid) {
	var call_info = callsInfo[userid];
	console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_TERMINATED);
	call_info.callState = STATE_TERMINATED;
	//            if (recordingState == RECORDING_STATE_STARTED) {

	//                           // Stop recording, since call is terminated.

	//

	//                           // TODO

	//

	//            }
	//            recordingState = RECORDING_STATE_STOPPED;
}

 

//function setCallStateRinging(userid) {

//            console.log('setCallStateRinging(' + userid + '); callsInfo: ' + JSON.stringify(callsInfo));  // Debug

//            var call_info = callsInfo[userid];

//            console.log('STATE TRANSITION: ' + call_info.callState + ' -> ' + STATE_RINGING);

//            call_info.callState = STATE_RINGING;

//}

 

// -----------------------------------------------------------------------

 

///**

// * Set Opus as the default audio codec if it's present.

// *

// * @param sdp SDP content to be modified

// * @returns the modified SDP content

// */

//function preferOpus(sdp) {

//            var sdpLines = sdp.split('\r\n');

//

//            // Search for m line.

//            for (var i = 0; i < sdpLines.length; i++) {

//                           if (sdpLines[i].search('m=audio') !== -1) {

//                                           var mLineIndex = i;

//                                           break;

//                           }

//            }

//            if (mLineIndex === null)

//                           return sdp;

//

//            // If Opus is available, set it as the default in m line.

//            for (var i = 0; i < sdpLines.length; i++) {

//                           if (sdpLines[i].search('opus/48000') !== -1) {

//                                           var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);

//                                           if (opusPayload)

//                                                           sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex],

//                                                                                          opusPayload);

//                                           break;

//                           }

//            }

//

//            // Remove CN in m line and sdp.

//            sdpLines = removeCN(sdpLines, mLineIndex);

//

//            sdp = sdpLines.join('\r\n');

//            return sdp;

//}

 

 

/**
* Set Opus as the default audio codec if it's present.
*
* @param sdp SDP content to be modified
* @returns the modified SDP content
*/
function preferOpus(sdp) {
	var sdpLines = sdp.split('\r\n');
	var mLineIndex = -1;


	// Search for m line.
	for (var i = 0; i < sdpLines.length; i++) {
		if (sdpLines[i].search('m=audio') !== -1) {
			mLineIndex = i;
			break;
		}
	}

	if (mLineIndex === -1) {
		return sdp;
	}


	// If Opus is available, set it as the default in m line.
	for (i = 0; i < sdpLines.length; i++) {
		if (sdpLines[i].search('opus/48000') !== -1) {
			var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
			if (opusPayload) {
				sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
			}
			break;
		}
	}


	// Remove CN in m line and sdp.
	sdpLines = removeCN(sdpLines, mLineIndex);

	sdp = sdpLines.join('\r\n');
	return sdp;
}

 

 

/**
*
* @param sdpLine
* @param pattern
* @returns
*/
function extractSdp(sdpLine, pattern) {
	var result = sdpLine.match(pattern);
	return (result && result.length == 2) ? result[1] : null;
}

 

 

/**
* Set the selected codec to the first in m line.
*/
function setDefaultCodec(mLine, payload) {
	var elements = mLine.split(' ');
	var newLine = new Array();
	var index = 0;
	for (var i = 0; i < elements.length; i++) {
		if (index === 3) // Format of media starts from the fourth.
			newLine[index++] = payload; // Put target payload to the first.
		if (elements[i] !== payload)
			newLine[index++] = elements[i];
	}
	return newLine.join(' ');
}

 

 

/**
* Strip CN from sdp before CN constraints is ready.
*/
function removeCN(sdpLines, mLineIndex) {
	var mLineElements = sdpLines[mLineIndex].split(' ');
	// Scan from end for the convenience of removing an item.
	for (var i = sdpLines.length - 1; i >= 0; i--) {
		var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
		if (payload) {
			var cnPos = mLineElements.indexOf(payload);
			if (cnPos !== -1) {
				// Remove CN payload from m line.
				mLineElements.splice(cnPos, 1);
			}
			// Remove CN line in sdp
			sdpLines.splice(i, 1);
		}
	}


	sdpLines[mLineIndex] = mLineElements.join(' ');
	return sdpLines;
}

 

 

 

//-- Recording -----------------------------------------------------------

/**
* Start recording of current call.
*/
function startRecordCurrentCall() {
	// alert('Recording of current call started!');


	recordingState = RECORDING_STATE_STARTED;
	buttonStopRecord.disabled = false;
	buttonStartRecord.disabled = true;


	// Local video
	localVideoRecordRTC = RecordRTC(localMediaStream, RECORDING_OPTIONS_VIDEO);
	localVideoRecordRTC.startRecording();


	// Local audio
	localAudioRecordRTC = RecordRTC(localMediaStream);
	localAudioRecordRTC.startRecording();


	// Remote video
	remoteVideoRecordRTC = RecordRTC(remoteStream, RECORDING_OPTIONS_VIDEO);
	remoteVideoRecordRTC.startRecording();



	// Remote audio
	remoteAudioRecordRTC = RecordRTC(remoteStream);
	remoteAudioRecordRTC.startRecording();
}

 

 

/**
* Stop recording of current call.
*/
function stopRecordCurrentCall() {
	// alert('Recording of current call stopped!');

	recordingState = RECORDING_STATE_STOPPED;
	buttonStopRecord.disabled = true;
	buttonStartRecord.disabled = false;

	// Local video
	localVideoRecordRTC.stopRecording(function(videoURL) {
		window.open(videoURL, 'LocalVideo', 'titlebar=yes');
		// TODO
	});



	// Local audio
	localAudioRecordRTC.stopRecording(function(audioURL) {
		window.open(audioURL, 'LocalAudio', 'titlebar=yes');
		// TODO
	});



	// Remote video

	remoteVideoRecordRTC.stopRecording(function(videoURL) {
		window.open(videoURL, 'RemoteVideo', 'titlebar=yes');
		// TODO
	});



	// Remote audio
	remoteAudioRecordRTC.stopRecording(function(audioURL) {
		window.open(audioURL, 'RemoteAudio', 'titlebar=yes');
		// TODO
	});

}

 

//------------------------------------------------------------------------

 

 

 

// ----------- Web audio utilities ---------------------------------------
function createAudioContext() {
	try {
		// Fix up for prefixing
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		var res = new AudioContext();
		return res;
	} catch (e) {
		console.log('Warning: Web Audio API is not supported in this browser!!');
		return null;
	}
}

 

 

/**
* Load a sound as an array buffer
*
* @param url URL of the sound to be loaded
* @param audioContext
* @param callback called when sound is loaded; the load array buffer is passed as
*        parameter.
*/
function loadSound(url, audioContext, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	// Decode asynchronously
	request.onload = function() {
		audioContext.decodeAudioData(request.response, function(buffer) {
			callback(buffer);
		}, function(error) {
			console.log('Error loading ring sound: ' + error);
		});
	}
	request.send();
}

 

 

/**
* Play a sound.
*
* @param buffer buffer containing the sound to be played.
* @return the sound source created.
*/
function playSound(buffer, audioContext) {
	var source = audioContext.createBufferSource();          // creates a sound source
	source.buffer = buffer;                // tell the source which sound to play
	source.connect(audioContext.destination);   // connect the source to the
		                                                                                                                                                                        // context's destination (the
		                                                                                                                                                                        // speakers)
	source.start(0); // play the source now
	// note: on older systems, may have to use deprecated noteOn(time);
	return source;
}

 

 

/**
* Ring player class
*
* @param aContext
*/
function RingPlayer(aContext) {
	const RING_SOUND_URL = '/sound/telephone-ring-1.mp3';
	const IDLE = 'idle';
	const RINGING = 'ringing';
	const RINGING_PERIOD = 3000;

	var audioContext = aContext;
	var ringSoundBuffer;
	var bufferSource;
	var state = IDLE;

	var that = this;

	var intervalId = null;

	loadSound(RING_SOUND_URL, audioContext, function(buffer) {
		ringSoundBuffer = buffer;
	});

	this.start = function() {
		if (state == IDLE) {
			state = RINGING;
			that.play();
			intervalId = setInterval(function() {
						   that.play()
			}, RINGING_PERIOD);
		}
	}

	this.play = function() {
		// if (bufferSource)
		// bufferSource.start(0);
		// else
		bufferSource = playSound(ringSoundBuffer, audioContext);
	}



	this.stop = function() {
		state = IDLE;
		clearInterval(intervalId);
		if (bufferSource)
			bufferSource.stop(0);
	};
}

 

// -----------------------------------------------------------------------

 

// - Button handlers -----------------------------------------------------

 

/**
* Open Chat
*/
function openChat() {
	// TODO
	alert('Not yet implemented!');
}

 

/**
* Send File
*/
function sendFile() {
	// TODO
	alert('Not yet implemented!');
}


 

/**
* Share Desktop
*/
function shareDesktop() {
                // TODO
//            alert('Not yet implemented!');
	startSharingScreen(currentGroupId, currentUserId);
}

/**
* Stop Share Desktop
*/
function stopShareDesktop() {
                // TODO
//            alert('Not yet implemented!'); 
	stopSharingScreen(currentGroupId, currentUserId);
}


/**
*	Send update flag shareScreen
**/
function sendShareScreenFlag(group, user, flag){
	var msg = {
		groupid: group,
		userid: user,
		shareScreen: flag
	};

	signallingSocket.emit(UPDATE_FLAG_SHARESCREEN, msg);
}
 
/**
*	Send screen data
*/
function sendScreenUsers(){
	shareDesktopFlag = true;
	console.log("Send Screen to users.");
	console.log(registeredUsers);
	for (var userid in registeredUsers) {	
		// Initiate a call-screen for each user.
		initiateCallScreen(userid);
    }
}



/**
* Auto Focus
*/
function autoFocus() {
	// TODO
	alert('Not yet implemented!');
}

 

/**
* Mute
*/
function mute() {
	// TODO
	alert('Not yet implemented!');
}

               

/**
* Volume Control
*/
function volumeControl() {
	// TODO
	alert('Not yet implemented!');
}

               

 

/**
* Pause
*/
function pause() {
	// TODO
	alert('Not yet implemented!');
}

               

/**
* Record
*/
function record() {
	// TODO
	alert('Not yet implemented!');
}

 

/**
* Quit
*/
/*
function quit() {
	// TODO
	signallingSocket.disconnect();
	parent.history.back();
	//window.location.href="webrtc_multi";
}
*/

quit = function() {
	// TODO
	signallingSocket.disconnect()
	//console.log('Detaching local media from localVideo');
	//detachMediaStream(localVideo); // TODO
	//parent.history.back();
	}


// -----------------------------------------------------------------------
 
/**
* Get the currently registered users. The response to the request message sent to
* signalling service is processed in the callback to the
* signallingSocket.on('getRegisteredUsersResult') register operation.
*
* @return List of already registered users. Array of objects with the following format:
*         {userid: user_id,
*          userName: user_name,
*          registerTime: register_time}
*         Note: registerTime may be used to order calls according arrival order to the
*         group.
*        
*/
function getRegisteredUsersAndEstablishConnections() {
	var message = {
		groupid : currentGroupId,
		userid: currentUserId
	};
	console.log('Sending getReisteredUsers request: ' + JSON.stringify(message));
	signallingSocket.emit('getRegisteredUsers', message);
}

 

 

/**
*
* @param usersInformation object with the following structure:
*        {<userid>: {userid: <userid>,
*                                             groupid: <groupid>,
*                    name: <name>,
*                    registerTime: <registerTime>
*                   }
*        }
*
*/
function refreshRegisteredUsers(usersInformation) {
	console.log("RefreshRegisteredUsers");
	console.log(usersInformation);
	//Compruebo la lista que me mandan con la que ya tenía
	//para abrir una conexión de escritorio con el nuevo
	if(shareDesktopFlag){
		for (var userid in usersInformation){
			if(userid != currentUserId){
				if(typeof registeredUsers[userid] == "undefined"){
						console.log("Initiate remote CallScreen with "+userid);
						initiateCallScreen(userid);
				}
			}
		}
	}
	registeredUsers = usersInformation;
	delete registeredUsers[currentUserId];  // Remove current user id
	// TODO More??
}

 

 

/**
*
* @param usersInformation object with the following structure:
*        {<userid>: {userid: <userid>,
*                                             groupid: <groupid>,
*                    name: <name>,
*                    registerTime: <registerTime>
*                   }sudo l
*        }
*
*/
function establishConnections(usersInformation) {
	console.log('Establishing connections to ' + JSON.stringify(usersInformation));              
	for (var userid in usersInformation) {
		// Initiate a call for each user.
		initiateCall(userid);

		//TODO
		// Check if user is sharing the desktop
		// yes--> initiateCallScreen(userid)
		if(registeredUsers[userid].shareScreen == 1){
			console.log('Establishing shareScreen connections to ' + JSON.stringify(registeredUsers[userid]));
			//initiateCallScreen(userid);
		}
		
	}
}

 

 

/**
* Starts sharing current screen.
*
* @param groupid
* @param userid
*/
function startSharingScreen(groupid, userid) {
	


	var request = {
					"messg":"startShareHI", 
					"state":"startComunication",
					"shareTypes":["window"]//["tap"]//["screen","window"]
				  };
	window.postMessage( request, '*' );
	window.addEventListener("message", function(event){
		if(event.data.state == "completed"){
			console.log("\-- COMPLETED --");
			console.log(event.data);
			var SCREEN_SHARING_MEDIA_CONSTRAINTS = {
						audio : false,
						video: {
							   mandatory: {
								            chromeMediaSource: 'desktop',
											chromeMediaSourceId: event.data.streamId,
											maxWidth: 1280,
											maxHeight: 720,
											minWidth: 1280,
											minHeight: 720
							   },
							   optional: []
						}
					};
	
			console.log('SCREEN_SHARING_MEDIA_CONSTRAINTS: ' + JSON.stringify(SCREEN_SHARING_MEDIA_CONSTRAINTS));  // Debug
			
			/*var requestHide = {
					"messg":"hideShareDialog", 
					"state":"hideShareDialog",
					"id": event.data.streamId
				  };
			window.postMessage( requestHide, '*' );*/
	
			getUserMedia(SCREEN_SHARING_MEDIA_CONSTRAINTS, function(mediaStream) {
				localScreenStream = mediaStream;
				// somebody clicked on "Stop sharing"
				localScreenStream.getVideoTracks()[0].onended = function () {
					console.log("Stop with chrome button!");
					stopShareDesktop();
				};
				attachMediaStream(localScreenVideoSmall, localScreenStream);
				localScreenVideoSmall.style.opacity = 1;
				console.log('Requested access to local media for screen sharing, with mediaConstraints:\n'
									       + '  \'' + JSON.stringify(SCREEN_SHARING_MEDIA_CONSTRAINTS) + '\'');
				// Get all users already registered in current group.
				// Response to this call initiates the all interactions.
				// As a result of the execution of this function, the 'getRegisteredUsersResult'
				// will be received. This message is processed in point 2.1.2.
				//--->getRegisteredUsersAndStartSharingScreen();
				sendShareScreenFlag(currentGroupId, currentUserId, 1);
				sendScreenUsers();
				$("#buttonShareDesktop").attr('onclick','stopShareDesktop()');
				$("#buttonShareDesktop").html('<span class="icon-share-desktop button-icon"></span>Stop');
			}, function(err) {
				console.log("Error getting local media for screen sharing: " + JSON.stringify(err));  // TODO Complete error message
			});
		}else{
			console.log(event.data);
		}
	}, false);

}

/**
* Stop sharing current screen.
*
* @param groupid
* @param userid
*/
function stopSharingScreen(groupid, userid) {
	shareDesktopFlag = false;
	
	var data = {
		userid: userid,
		groupid: groupid,
	};
	signallingSocket.emit('stopShareScreen',data);
	
	console.log("Stop sharing screen! userid: "+userid+" groupid: "+groupid);
	$("#buttonShareDesktop").attr('onclick','shareDesktop()');
	$("#buttonShareDesktop").html('<span class="icon-share-desktop button-icon"></span>Desktop');
	
	detachMediaStream(localScreenVideoSmall);
	
	
	console.log("END stopSharingScreen");
}


/**
*	Order remote video divs alphabetically by id
*/
function orderDivsAlphabeticallyByID(){
	console.log("Sort divs remote video");
	$divs = $('div.videoRemote');
	var alphabeticallyOrderedDivs = $divs.sort(function (a, b) {
        return $(a).attr("id") > $(b).attr("id");
    });
    $("#divRemoteViews").html(alphabeticallyOrderedDivs);
}


/**
*	Insert divs remote video alphabetically
*/
function insertDivAlphabetically(idContainer, jsElementToInsert){
	var inserted = false;
	var elementInsertID = jsElementToInsert.getAttribute('id');
	
	var children = $('#'+idContainer).children();
	var numChildren = children.length;
	
	console.warn("Numbers of remote streams: "+numChildren);
	var lastChild = null;
	$.each(children, function(index, child){
		console.warn("("+index+"): "+$(child).attr('id'));
		if(elementInsertID < $(child).attr('id')){
			//insert before
			child.parentNode.insertBefore(jsElementToInsert,child);
			inserted = true;
			console.warn("\t"+$(child).attr('id')+" > "+elementInsertID);
			console.warn("\t"+elementInsertID+" before to "+$(child).attr('id'));
			return false;
		}
		lastChild = child;
	});
	if(!inserted){
		if(lastChild == null){
			divRemoteViews.appendChild(jsElementToInsert);
			console.warn("\tFirst element "+elementInsertID);
		}else{
			lastChild.parentNode.insertBefore(jsElementToInsert,lastChild.nextSibling);
			console.warn("\tLast one element "+elementInsertID);
		}
	}
}


