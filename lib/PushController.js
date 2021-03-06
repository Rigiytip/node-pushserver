/**
 * Created with JetBrains WebStorm.
 * User: Vincent Lemeunier
 * Date: 06/06/13
 * Time: 15:41
 */

var _ = require('lodash'),
    pushAssociations = require('./PushAssociations'),
    gcmPusher = require('./GCMPusher');


var send = function (pushAssociations, androidPayload, iosPayload) {

    var langTokens = _.groupBy(pushAssociations, function(elem) {
        if (typeof elem.lang == 'undefined')
            return '';
        return elem.lang+'';
    });

    for (var lang in langTokens) {
        var androidTokens = [];
        var iosTokens = [];
        if (langTokens[lang]) {
            androidTokens = _(langTokens[lang]).where({type: 'android'}).map('token').value();
            iosTokens = _(langTokens[lang]).where({type: 'ios'}).map('token').value();
        }

        if (androidPayload && androidTokens.length > 0) {
            var gcmPayload = gcmPusher.buildPayload(androidPayload[lang]);
            gcmPusher.push(androidTokens, gcmPayload);
        }

        if (iosPayload && iosTokens.length > 0) {
            var apnPayload = gcmPusher.buildPayload(iosPayload[lang]);
            gcmPusher.push(iosTokens, apnPayload);
        }
    }
};

var sendUsers = function (users, payload) {
    pushAssociations.getForUsers(users, function (err, pushAss) {
        if (err) return;
        send(pushAss, payload);
    });
};

var subscribe = function (deviceInfo) {
    pushAssociations.add(deviceInfo.user, deviceInfo.type, deviceInfo.token, deviceInfo.lang);
};

var unsubscribeDevice = function (deviceToken) {
    pushAssociations.removeDevice(deviceToken);
};

var unsubscribeUser = function (user) {
    pushAssociations.removeForUser(user);
};

module.exports = {
    send: send,
    sendUsers: sendUsers,
    subscribe: subscribe,
    unsubscribeDevice: unsubscribeDevice,
    unsubscribeUser: unsubscribeUser
};
