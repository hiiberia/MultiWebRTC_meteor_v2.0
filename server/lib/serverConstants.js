SOCKET_IO_DEBUG_MODE = false;

SERVER_IP = "192.168.26.173";
//SERVER_IP = "192.168.10.116";
SERVER_PORT = 1337;


/*****************************/
// SIGNALING MESSAGES NAMES
/*****************************/
INVITE = 'invite';
SESSION_PROGRESS = 'sessionProgress';  // ~ 183 (Session Progress)
OK = 'ok';  // ~ 200 (OK)
BYE = 'bye';
ACK = 'ack';
ICE_CANDIDATE = 'iceCandidate';
RINGING = 'ringing';  // ~ 180 (Ringing)
DECLINE = 'decline';  // ~ 603 (Decline)
BUSY = 'busy';  // ~ 600 (Busy Everywhere)
UPDATE_FLAG_SHARESCREEN = 'updateShareScreen';
STOP_SHARE_SCREEN = 'stopShareScreen';
REGISTER = 'register';
DEREGISTER = 'deregister';
USERS_INFORMATION_UPDATE = 'usersInformationUpdate';
DISCONNECT = 'disconnect';
GET_REGISTERED_USERS = 'getRegisteredUsers';
GET_REGISTERED_USERS_RESULT = 'getRegisteredUsersResult';
CLOSE = 'close';

/*****************************/
// SIGNALING STATES
/*****************************/
STATE_INITIATING = 'initiating';
STATE_RINGING = 'ringing';
STATE_ESTABLISHED = 'established';
STATE_TERMINATING = 'terminating';
STATE_TERMINATED = 'terminated';
STATE_IDLE = 'idle';


GET_REGISTERED_USERS_URL_PATTERN = /\/users\/list(\/?)$/;
TEST_WRTC = /\/testwrtc(\/?)$/;


MEDIA_GATE_WAY_ID = 'mediaGateWay';
MEDIA_GATE_WAY_GROUP = 'mediaGateWayGroup';
