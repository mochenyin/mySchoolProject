/*mysql数据模块
*/
var _mysql={};

var conn=_mysql.conn=$mysql.createConnection({
	host:'182.254.243.74',
	port:'3306',
	database:'myProject',
	user:'root',
	password:'Nchu-32456'
});

conn.connect();

//导出模块
module.exports = _mysql;
