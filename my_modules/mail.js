/**
 * Created by SWSD on 2017-02-23.
 */
// var nodemailer = require('nodemailer');
// var smtpTransport =require('nodemailer-smtp-transport');

var  email={
    service: 'QQ',
    user: '978145022@qq.com',
    pass: 'usbojgoyvjecbdch',
    };

var _sendMail= $nodemailer.createTransport($smtpTransport({
    service: email.service,
    auth: {
        user: email.user,
        pass: email.pass
    }
}));


/**
 * @param {String} recipient 收件人
 * @param {String} subject 发送的主题
 * @param {String} html 发送的html内容
 */
 //_sendMail.msg = function (recipient, subject, html) {

// _sendMail.sendMail({
//         from: email.user,
//         to: recipient,
//         subject: subject,
//         html: html
//
//     }, function (error, response) {
//         if (error) {
//             console.log(error);
//         }
//         console.log('发送成功')
//     });
//};

module.exports = _sendMail;