export var CommandType;
(function (CommandType) {
    // ... other commands ...
    CommandType["GET_LOCAL_TIME"] = "getLocalTime";
    CommandType["ECHO"] = "echo";
    CommandType["GET_HOSTNAME"] = "getHostname";
})(CommandType || (CommandType = {}));
