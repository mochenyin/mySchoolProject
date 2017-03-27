var wrapper = require('co-mysql');
var wrapperedConn;

function handleMysql() {
	var conn = $mysql.createConnection({
		host:'182.254.243.74',
		port:'3306',
		database:'myProject',
		user:'root',
		password:'Nchu-3245'
	});

	//连接错误，2秒重试
	conn.connect(function (err) {
		if (err) {
			console.log('error when connecting to db:', err);
			setTimeout(handleMysql, 5000);
		}
	});

	conn.on('error', function (err) {
		console.log("db error :" + err);
		// 如果是连接断开，自动重新连接
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleMysql();
		}
	});
	setInterval(function () {
		conn.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
			console.log('The solution is: 2');
		});
	}, 3600000);
	console.log('mysql is ready!')
	wrapperedConn = wrapper(conn);
}
handleMysql();

var _Mysql = {
	conn: wrapperedConn
};
module.exports = _Mysql;
