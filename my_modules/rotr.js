
/*http路由分发
接口模式server/:app/:api
*/

var _rotr = {};

//http请求的路由控制
_rotr = new $router();

//访问的请求
_rotr.get('api', '/api/:apiname', apihandler);
_rotr.post('api', '/api/:apiname', apihandler);





/*所有api处理函数都收集到这里
必须是返回promise
各个api处理函数用promise衔接,return传递ctx
*/
_rotr.apis = {};

/*处理Api请求
默认tenk的api直接使用
每个app的独立api格式appname_apiname
*/
function* apihandler(next) {
	var ctx = this;
	var apinm = ctx.params.apiname;

	console.log('API RECV:', apinm);

	//匹配到路由函数,路由函数异常自动返回错误,创建xdat用来传递共享数据
	var apifn = _rotr.apis[apinm];
	ctx.xdat = {
		apiName: apinm
	};

	if (apifn && apifn.constructor == Function) {
		yield apifn.call(ctx, next).then(function () {

			//所有接口都支持JSONP,限定xx.x.xmgc360.com域名
			var jsonpCallback = ctx.query.callback || ctx.request.body.callback;
			if (jsonpCallback && ctx.body) {
				if (_cfg.regx.crossDomains.test(ctx.hostname)) {
					ctx.body = ctx.query.callback + '(' + JSON.stringify(ctx.body) + ')';
				};
			};

		}, function (err) {
			ctx.body = __newMsg(__errCode.APIERR, [err.message, 'API proc failed:' + apinm + '.']);
			__errhdlr(err);
		});
	} else {
		ctx.body = __newMsg(__errCode.NOTFOUND, ['服务端找不到接口程序', 'API miss:' + apinm + '.']);
	};

	yield next;
};




/*测试接口,返回请求的数据
 */
//向邮箱发送验证码
_rotr.apis.checkMailMsg = function () {
	var ctx = this;
	var co = $co(function* () {
		var recipient = ctx.query.recipient || ctx.request.body.recipient;
		var subject = ctx.query.subject || ctx.request.body.subject;
		var html = ctx.query.html || ctx.request.body.html;
		var rows = yield _ctnu(
			_sendMail.sendMail({
				from:'978145022@qq.com',
				to: recipient,
				subject: subject,
				html: html
			})
		);
		if (!rows) Error("发送失败");
		ctx.body = __newMsg(1, 'ok');
		return ctx;
	});
	return co;
};
//获取token
_rotr.apis.getToken = function () {
	var ctx = this;
	var co = $co(function* () {
		var file = ctx.query.file || ctx.request.body.file;
		//var filePath = ctx.query.filePath || ctx.request.body.filePath;
		var rows = yield _ctnu(_token);
		if (!rows) Error("获取token失败");
		ctx.body = __newMsg(1, 'ok',_token);
		return ctx;
	});
	return co;
};


//用户注册
_rotr.apis.register = function () {
	var ctx = this;
	var email = ctx.query.email || ctx.request.body.email;
	var pwd = ctx.query.pwd || ctx.request.body.pwd;
	var userImg = ctx.query.userImg || ctx.request.body.userImg;
	var paramt1=[email,pwd,userImg];
	var paramt=[email];
	var co = $co(function* () {
		var sqlstr = "select * from user where userEmail=?;";
		var sqlstr1='insert into user(userEmail,userPwd,userImg) values(?,?,?);';
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramt);
		if (rows.length==0){
			var rows1 = yield _ctnu([_Mysql.conn, 'query'], sqlstr1,paramt1);
			if (rows1.affectedRows == 0) throw Error("错误");
			ctx.body = __newMsg(1, 'ok');
		}
		else{
			ctx.body = __newMsg(1, 'repeat');
		}
		return ctx;
	});
	return co;
};

//用户登录
_rotr.apis.getLogin = function () {
	var ctx = this;
	var email = ctx.query.email || ctx.request.body.email;
	var pwd = ctx.query.pwd || ctx.request.body.pwd;
	var paramt1=[email,pwd];
	var co = $co(function* () {
		var sqlstr = "select * from user where userEmail=? and userPwd=?;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramt1);
		if (rows.length==0){
			ctx.body = __newMsg(1, '邮箱或密码输入有误，请确认');
		} 
		else{
			ctx.body = __newMsg(1, 'ok',rows[0]);
		}
		return ctx;
	});
	return co;
};

//修改密码
_rotr.apis.updatePwd=function(){
	var ctx = this;
	var email = ctx.query.email || ctx.request.body.email;
	var pwd = ctx.query.pwd || ctx.request.body.pwd;
	var paramt1=[pwd,email];
	var co = $co(function* () {
		var sqlstr = "update user set userPwd=? where userEmail=?;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramt1);
		if (rows.affectedRows==0){
			ctx.body = __newMsg(1, '邮箱或密码输入有误，请确认');
		}
		else{
			ctx.body = __newMsg(1, 'ok');
		}
		return ctx;
	});
	return co;
};

//修改用户头像
_rotr.apis.changeUserImg = function () {
	var ctx = this;
	var key = ctx.query.key || ctx.request.body.key;
	var userId = ctx.query.userId || ctx.request.body.userId;
	var paramt=[key,userId];
	var paramt1=[userId];
	var co = $co(function* () {
		var sqlstr = "update user set userImg=? where userId=?;";
		var sqlstr1 = "select userImg from user where userId=?;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramt);
		var rows1 = yield _ctnu([_Mysql.conn, 'query'], sqlstr1,paramt1);
		if (rows.affectedRows==0){
			ctx.body = __newMsg(1, '修改失败');
		}
		else{
			ctx.body = __newMsg(1, 'ok',rows1);
		}
		return ctx;
	});
	return co;
};
//管理员登录
_rotr.apis.getManagerLogin = function () {
	var ctx = this;
	var email = ctx.query.email || ctx.request.body.email;
	var pwd = ctx.query.pwd || ctx.request.body.pwd;
	var paramt1=[email,pwd];
	var co = $co(function* () {
		var sqlstr1 = "select * from user where userId=? and userPwd=?";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr1,paramt1);
		if (rows.length==0){
			ctx.body = __newMsg(1, 'none');
		}
		else if(rows[0].role==0){
			ctx.body = __newMsg(1, 'false',rows);
		}
		else{
			ctx.body = __newMsg(1, 'ok',rows);
		}
		return ctx;
	});
	return co;
};
//添加轮播图片
_rotr.apis.addChangeImg = function () {
	var ctx = this;
	var imgUrl=ctx.query.imgUrl||ctx.request.body.imgUrl;
	var co = $co(function* () {
		var paramtl=[imgUrl,3];
		var sqlstr = "insert into imgChange(imgKey,addUserId) values(?,?);";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramtl);
		var sqlstr1='select * from imgChange where imgId=(select last_insert_id());';//查找imgId等于最后插入的数据的ID的数据
		var rows1 = yield _ctnu([_Mysql.conn, 'query'], sqlstr1);
		if(rows.affectedRows==1){
			ctx.body = __newMsg(1, 'ok',rows1);
		}
		return ctx;
	});
	return co;
};
//获取轮播图列表
_rotr.apis.getChangeImg = function () {
	var ctx = this;
	var type=ctx.query.type||ctx.request.body.type;
	var co = $co(function* () {
		var dat = {};
		if(type=='all'){
			var str1 = "SELECT * FROM imgChange WHERE flag=1;";
			var row1 = yield _ctnu([_Mysql.conn, "query"], str1);
			var str2 = "SELECT * FROM imgChange WHERE flag=0 order by createDate desc;";
			var row2 = yield _ctnu([_Mysql.conn, "query"], str2);
			dat={
				active:row1,
				unActive:row2,
			}
		}
      else{
			var str3 = "SELECT * FROM imgChange WHERE flag=1;";
			var row3 = yield _ctnu([_Mysql.conn, "query"], str3);
			dat={
				active:row3
			}
		}
		ctx.body = __newMsg(1, 'ok', dat);
		return ctx;
	});
	return co;
};
//删除轮播图
_rotr.apis.deleteChangeImg = function () {
	var ctx = this;
	var co = $co(function* () {
		var imgId = ctx.query.imgId || ctx.request.body.imgId;
		var paramt = [imgId];
		var sqlstr = "delete from imgChange where imgId=?;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr, paramt);
		if (rows.affectedRows==1){
			ctx.body = __newMsg(1, 'ok');
		}
		return ctx;
	});
	return co;
};

//改变轮播图使用状态
_rotr.apis.switchImgFlag = function () {
	var ctx = this;
	var flag=ctx.query.flag||ctx.request.body.flag;
	var imgId=ctx.query.imgId||ctx.request.body.imgId;
	var co = $co(function* () {
		var sqlstr = "update imgChange set flag=? where imgId=?";
		var paramtcl=[flag,imgId];
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramtcl);
		if(rows.affectedRows==1){
			ctx.body = __newMsg(1, 'ok', rows);
		}
		return ctx;
	});
	return co;
};

//socket.io
_rotr.apis.startSocketio = function () {
	var ctx = this;
	var co = $co(function* () {
		var rows = yield _ctnu(_webSocket);
		if (!rows) Error("socket.io连接错误");
		ctx.body = __newMsg(1, 'ok');
		return ctx;
	});
	return co;
};
//获取聊天主题分类
_rotr.apis.getChatStyle = function () {
	var ctx = this;
	var co = $co(function* () {
		var sqlstr = "select * from chatStyle;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if (!rows) throw Error("错误");
		ctx.body = __newMsg(1, 'ok', rows);
		return ctx;
	});
	return co;
};


//发布聊天话题
_rotr.apis.addChatRoom = function () {
	var ctx = this;
	var co = $co(function* () {
		var title = ctx.query.title || ctx.request.body.title;
		var description = ctx.query.description || ctx.request.body.description;
		var chatStyle = ctx.query.chatStyle || ctx.request.body.chatStyle;
		var sourceLink = ctx.query.sourceLink || ctx.request.body.sourceLink;
		var userId = ctx.query.userId || ctx.request.body.userId;
		var roomName = ctx.query.roomName || ctx.request.body.roomName;
		var sqlstr = "INSERT INTO room(roomTitle,roomDescription,roomStyle,roomImg,roomUserId,roomName) VALUES(?,?,?,?,?,?);";
		var paramt = [title, description,chatStyle,sourceLink,userId,roomName];
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr, paramt);
		if (!rows) throw Error("错误");
		ctx.body = __newMsg(1, 'ok', rows);
		return ctx;
	});
	return co;
};

//获取对应聊天分类内容
_rotr.apis.getChatClassify = function () {
	var ctx = this;
	var co = $co(function* () {
		var type = ctx.query.type || ctx.request.body.type;
		var paramtcl=[type];
		var sqlstr = "SELECT * FROM room  where roomStyle =(select chatId from chatStyle where chatTitle=?);";
		var sqlstr2='select chatName from chatStyle where chatTitle=?;';
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramtcl);
		var rows2 = yield _ctnu([_Mysql.conn, 'query'], sqlstr2,paramtcl);
		if(rows&&rows2){
			ctx.body = __newMsg(1, 'ok', {list:rows,classify:rows2});
		}
		return ctx;
	});
	return co;
};

//获取房间信息
_rotr.apis.getRoomMsg = function () {
	var ctx = this;
	var co = $co(function* () {
		var roomId = ctx.query.roomId || ctx.request.body.roomId;
		var paramtcl = [roomId];
		var sqlstr = "select * from room where roomId=?;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr, paramtcl);
		if(rows){
			ctx.body = __newMsg(1, 'ok', rows);
		}
		return ctx;
	});
	return co;
};
//获取聊天管理内容
_rotr.apis.getAllChatMngr = function () {
	var ctx = this;
	var co = $co(function* () {
		var str = "select r.roomId,chatMsgId,roomName,userName,DATE_FORMAT(addTime,'%Y-%c-%d %T') as addDate,userEmail,roomTitle,chatMsg from room r INNER JOIN (select roomId,userName,addTime,userEmail," +
			" chatMsg,chatMsgId from chatMsg c INNER JOIN (select userId,userName,userEmail from user) u where u.userId=c.userId) a where r.roomId=a.roomId;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], str);
		if (rows){
			ctx.body = __newMsg(1, 'ok',rows);
		}
		return ctx;
	});
	return co;
};

//获取主题管理内容
_rotr.apis.getAllThemeMngr = function () {
	var ctx = this;
	var co = $co(function* () {
		var str = "select userName,themeId,themeTitle,themeDesc,classifyText,add_date from classify INNER JOIN (" +
			" select userName,themeId,themeTitle,themeDesc,themeClassify,DATE_FORMAT(addTime, '%Y-%c-%d %T' ) " +
			" as add_date from theme INNER JOIN user where theme.themeUserId=`user`.userId) a where classify.classifyId=a.themeClassify;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], str);
		if (rows){
			ctx.body = __newMsg(1, 'ok',rows);
		}
		return ctx;
	});
	return co;
};


//获取房间管理内容
_rotr.apis.getAllRoomMngr = function () {
	var ctx = this;
	var co = $co(function* () {
		var str = "select userName,userEmail,roomId,roomTitle,roomDescription,chatName from chatstyle c INNER JOIN (SELECT userName,userEmail," +
			"roomId,roomTitle,roomDescription,roomStyle FROM user u inner JOIN room r ON u.userId=r.roomUserId) a on c.chatId=a.roomStyle;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], str);
		if (rows){
			ctx.body = __newMsg(1, 'ok',rows);
		}
		return ctx;
	});
	return co;
};

//删除房间
_rotr.apis.deleteRoom = function () {
	var ctx = this;
	var co = $co(function* () {
		var roomId = ctx.query.roomId || ctx.request.body.roomId;
		var sqlstr = "delete from room where roomId=" + roomId + "";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(rows.affectedRows==1){
			ctx.body = __newMsg(1, 'ok');
		}
		return ctx;
	});
	return co;
};
//删除聊天
_rotr.apis.deleteChat = function () {
	var ctx = this;
	var co = $co(function* () {
		var chatMsgId = ctx.query.chatMsgId || ctx.request.body.chatMsgId;
		var sqlstr = "delete from chatMsg where chatMsgId=" + chatMsgId + "";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(rows.affectedRows==1){
			ctx.body = __newMsg(1, 'ok');
		}
		return ctx;
	});
	return co;
};

//获取轮播图接口
_rotr.apis.addChatMsg = function () {
	var ctx = this;
	var userId=ctx.query.userId||ctx.request.body.userId;
	var roomId=ctx.query.roomId||ctx.request.body.roomId;
	var chatMsg=ctx.query.chatMsg||ctx.request.body.chatMsg;
	var co = $co(function* () {
		var sqlstr = "insert into chatMsg(userId,roomId,chatMsg) values(?,?,?)";
		var qaramtc=[userId,roomId,chatMsg];
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,qaramtc);
		if(rows.affectedRows==1){
			ctx.body = __newMsg(1, 'ok', rows);
		}
		return ctx;
	});
	return co;
};

//获取该房间所有聊天信息
_rotr.apis.getAllMsgs = function () {
	var ctx = this;
	var co = $co(function* () {
		var roomId = ctx.query.roomId || ctx.request.body.roomId;
		var paramtc=[roomId];
		var str = "select userName,userImg,chatMsg,roomId,add_date,u.userId from (select userName,userImg,userId from user) u INNER JOIN "+
		"(SELECT chatMsgId,roomId,userId,chatMsg,DATE_FORMAT(addTime, '%T' ) as add_date "+
		"FROM chatMsg where DATE_FORMAT(addTime,'%Y-%c-%d')=DATE_FORMAT(NOW(), '%Y-%c-%d') and roomId=?) c "+
		"where u.userId=c.userId ORDER BY add_date;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], str,paramtc);
		if(rows){
			ctx.body = __newMsg(1, 'ok', rows);
		}
		else{
			ctx.body = __newMsg(1, 'noMsg');
		}
		return ctx;
	});
	return co;
};
//获取用户信息
_rotr.apis.getUserMngr = function () {
	var ctx = this;
	var co = $co(function* () {
		var role = ctx.query.role || ctx.request.body.role;
		var sqlstr = "select * from user where role ='" + role + " ';";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		ctx.body = __newMsg(1, 'ok',rows);
		return ctx;
	});
	return co;
};

//删除用户
_rotr.apis.deleteUser=function(){
    var ctx=this;
	var co=$co(function *(){
		var userId=ctx.query.userId||ctx.request.body.userId;
		var sqlstr='delete from user where userId="'+userId+'";';
		var rows=yield _ctnu([_Mysql.conn,'query'],sqlstr);
		if(rows.affectedRows==1){
			ctx.body=__newMsg(1,'ok',rows);
		}
		return ctx;
	});
	return co;
};

//修改用户角色
_rotr.apis.changeUserRole = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var role = ctx.query.role || ctx.request.body.role;
		var sqlstr = "update user set role="+role+" where userId =" + userId + ";";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		ctx.body = __newMsg(1, 'ok');
		return ctx;
	});
	return co;
};


//获取分类封面及各分类主题
_rotr.apis.getCover = function () {
	var ctx = this;
	var co = $co(function* () {
		var classifyId=ctx.query.id||ctx.request.body.id;
		var sqlstr = "select * from classify where classifyId="+classifyId+";";
		var sqlstr2 = "select * from classify where isClassifyIndex="+classifyId+";";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		var rows2 = yield _ctnu([_Mysql.conn, 'query'], sqlstr2);
	if(rows){
		ctx.body = __newMsg(1, 'ok',{rows:rows,rows2:rows2});
	}
		return ctx;
	});
	return co;
};
//发布文字分享主题内容
_rotr.apis.addThemeMsg = function () {
	var ctx = this;
	var co = $co(function* () {
		var themeUserId = ctx.query.themeUserId || ctx.request.body.themeUserId;
		var themeClassify = ctx.query.themeClassify || ctx.request.body.themeClassify;
		var themeTitle = ctx.query.themeTitle || ctx.request.body.themeTitle;
		var themeDesc = ctx.query.themeDesc || ctx.request.body.themeDesc;
		var themeContent = ctx.query.themeContent || ctx.request.body.themeContent;
		var themeImages = ctx.query.themeImages || ctx.request.body.themeImages;
		var sqlstr = "insert into theme(themeUserId,themeClassify,themeTitle,themeDesc,themeContent,themeImages) values(?,?,?,?,?,?);";
		var sqlstr1 = "select themeId,themeTitle,themeDesc,themeImages,classifyText,userName,userImg,DATE_FORMAT(addTime, '%Y-%c-%d %T' ) as add_date from" +
			" (select * from (select classifyId,classifyText from classify where classifyId="+themeClassify+" ) c INNER JOIN" +
			" (select * from theme where themeId=(select last_insert_id())) t where t.themeClassify=c.classifyId) a INNER JOIN (select userId,userName,userImg from user)" +
			" u where a.themeUserId=u.userId ;";
		var paramtc=[themeUserId,themeClassify,themeTitle,themeDesc,themeContent,themeImages];
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramtc);
		var rows1 = yield _ctnu([_Mysql.conn, 'query'], sqlstr1);
		if (rows){
			ctx.body = __newMsg(1, 'ok', rows1);
		}
		return ctx;
	});
	return co;
};
//获取各分类主题
_rotr.apis.getThemeMsg = function () {
	var ctx = this;
	var co = $co(function* () {
		var id = ctx.query.id || ctx.request.body.id;
		var index = ctx.query.index || ctx.request.body.index;
		var sqlstr = "select themeId,themeTitle,themeDesc,themeImages,classifyText,classifyId,userName,userImg,DATE_FORMAT(addTime, '%Y-%c-%d %T' ) as add_date" +
			" from (select * from theme t INNER JOIN (select classifyId,isClassifyIndex,classifyText from classify where" +
			" isClassifyIndex="+id+") c where t.themeClassify=c.classifyId ) a INNER JOIN (select userId,userName,userImg from user)" +
			" u where a.themeUserId=u.userId ORDER BY addTime desc;";
		var sqlstr3='select saveThemeId,count(*) as saveCount from save GROUP BY saveThemeId;';
		var sqlstr4='select thumbThemeId,count(*) as thumbCount from thumb GROUP BY thumbThemeId;';
		var sqlstr5='select themeId,count(*) as answerCount from themeanswer GROUP BY themeId;';
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		var rows3 = yield _ctnu([_Mysql.conn, 'query'], sqlstr3);
		var rows4 = yield _ctnu([_Mysql.conn, 'query'], sqlstr4);
		var rows5 = yield _ctnu([_Mysql.conn, 'query'], sqlstr5);
		if(rows.length!=0){
			ctx.body = __newMsg(1, 'ok', {rows:rows,rows3:rows3,rows4:rows4,rows5:rows5});
		}
		else{
			ctx.body = __newMsg(1, 'no');
		}
		return ctx;
	});
	return co;
};

//获取子分类主题
_rotr.apis.getClassify = function () {
	var ctx = this;
	var co = $co(function* () {
		var classifyId = ctx.query.classifyId || ctx.request.body.classifyId;
		var index = ctx.query.index || ctx.request.body.index;
		var sqlstr = "select themeId,themeTitle,themeDesc,themeImages,classifyText,classifyId,userName,userImg,DATE_FORMAT(addTime, '%Y-%c-%d %T' ) as add_date" +
			" from (select * from theme t INNER JOIN (select classifyId,classifyText from classify where" +
			" classifyId="+classifyId+") c where t.themeClassify=c.classifyId ) a INNER JOIN (select userId,userName,userImg from user)" +
			" u where a.themeUserId=u.userId ORDER BY addTime desc;";
		var sqlstr3='select saveThemeId,count(*) as saveCount from save where classifyId='+classifyId+' GROUP BY saveThemeId;';
		var sqlstr4='select thumbThemeId,count(*) as thumbCount from thumb where classifyId='+classifyId+' GROUP BY thumbThemeId;';
		var sqlstr5='select themeId,count(*) as answerCount from themeanswer where classifyId='+classifyId+' GROUP BY themeId;';
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		var rows3 = yield _ctnu([_Mysql.conn, 'query'], sqlstr3);
		var rows4 = yield _ctnu([_Mysql.conn, 'query'], sqlstr4);
		var rows5 = yield _ctnu([_Mysql.conn, 'query'], sqlstr5);
		if(rows.length!=0){
			ctx.body = __newMsg(1, 'ok', {rows:rows,rows3:rows3,rows4:rows4,rows5:rows5});
		}
		else{
			ctx.body = __newMsg(1, 'no');
		}
		return ctx;
	});
	return co;
};

//获取发现页面主题
_rotr.apis.getFindPageTheme = function () {
	var ctx = this;
	var co = $co(function* () {
		var index = ctx.query.index || ctx.request.body.index;
		var sqlstr = "select themeId,themeTitle,themeDesc,themeImages,classifyText,classifyId,userName,userImg,DATE_FORMAT(addTime, '%Y-%c-%d %T' ) as add_date" +
			" from (select * from theme t INNER JOIN (select classifyId,classifyText from classify " +
			" ) c where t.themeClassify=c.classifyId ) a INNER JOIN (select userId,userName,userImg from user)" +
			" u where a.themeUserId=u.userId ORDER BY addTime desc;";
		var sqlstr2='select classifyId,classifyText from classify where isClassifyIndex != 0 and classifyText !="默认";';
		var sqlstr3='select saveThemeId,count(*) as saveCount from save GROUP BY saveThemeId;';
		var sqlstr4='select thumbThemeId,count(*) as thumbCount from thumb GROUP BY thumbThemeId;';
		var sqlstr5='select themeId,count(*) as answerCount from themeanswer GROUP BY themeId;';
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		var rows2 = yield _ctnu([_Mysql.conn, 'query'], sqlstr2);
		var rows3 = yield _ctnu([_Mysql.conn, 'query'], sqlstr3);
		var rows4 = yield _ctnu([_Mysql.conn, 'query'], sqlstr4);
		var rows5 = yield _ctnu([_Mysql.conn, 'query'], sqlstr5);
			ctx.body = __newMsg(1, 'ok', {rows:rows,rows2:rows2,rows3:rows3,rows4:rows4,rows5:rows5});
		return ctx;
	});
	return co;
};

//获取个人主题
//获取发现页面主题
_rotr.apis.getPersonalTheme = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var sqlstr = "select themeId,themeTitle,themeDesc,themeImages,classifyText,classifyId,userName,userImg,DATE_FORMAT(addTime, '%Y-%c-%d %T' ) as add_date" +
			" from (select * from theme t INNER JOIN (select classifyId,classifyText from classify " +
			" ) c where t.themeClassify=c.classifyId ) a INNER JOIN (select userId,userName,userImg from user where userId="+userId+")" +
			" u where a.themeUserId=u.userId ORDER BY addTime desc;";

		var sqlstr3='select saveThemeId,count(*) as saveCount from save  GROUP BY saveThemeId;';
		var sqlstr4='select thumbThemeId,count(*) as thumbCount from thumb  GROUP BY thumbThemeId;';
		var sqlstr5='select themeId,count(*) as answerCount from themeAnswer  GROUP BY themeId;';
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		var rows3 = yield _ctnu([_Mysql.conn, 'query'], sqlstr3);
		var rows4 = yield _ctnu([_Mysql.conn, 'query'], sqlstr4);
		var rows5 = yield _ctnu([_Mysql.conn, 'query'], sqlstr5);
		ctx.body = __newMsg(1, 'ok', {rows:rows,rows3:rows3,rows4:rows4,rows5:rows5});
		return ctx;
	});
	return co;
};

//获取主题详情
_rotr.apis.getThemeDetail = function () {
	var ctx = this;
	var co = $co(function* () {
		var themeId = ctx.query.themeId || ctx.request.body.themeId;
		var str = "select userId,themeId,themeTitle,themeDesc,themeContent,themeImages,classifyText,userName,userImg,DATE_FORMAT(addTime, '%Y-%c-%d %T' ) as add_date " +
			"from(select * from (select classifyId,classifyText from classify ) c INNER JOIN" +
			" (select * from theme where themeId="+themeId+") t where t.themeClassify=c.classifyId) a INNER JOIN (select userId,userName,userImg from user)" +
			" u where a.themeUserId=u.userId ;";
		var str2="select userId,userName,userImg,themeAnswerId,answerThemeContent,anserThemeImg,DATE_FORMAT(addTime, '%Y-%c-%d %T' ) as add_date" +
			" from user INNER JOIN (select * from themeanswer where themeId="+themeId+") t where t.answerThemeUserId=user.userId;"
		var role = yield _ctnu([_Mysql.conn, 'query'], str);
		var rows = yield _ctnu([_Mysql.conn, 'query'], str2);
		if(role&&rows){
			ctx.body = __newMsg(1, 'ok',{role:role,rows:rows});
		}
		return ctx;
	});
	return co;
};

//发布主题回复
_rotr.apis.addThemeAnswer = function () {
	var ctx = this;
	var co = $co(function* () {
		var answerThemeUserId = ctx.query.answerThemeUserId || ctx.request.body.answerThemeUserId;
		var themeId = ctx.query.themeId || ctx.request.body.themeId;
		var answerThemeContent = ctx.query.answerThemeContent || ctx.request.body.answerThemeContent;
		var anserThemeImg = ctx.query.anserThemeImg || ctx.request.body.anserThemeImg;
		var classifyId=ctx.query.classifyId||ctx.request.body.classifyId;
        var paramtcl=[answerThemeUserId,themeId,answerThemeContent,anserThemeImg,classifyId];
		var sqlstr = "insert into themeAnswer(answerThemeUserId,themeId,answerThemeContent,anserThemeImg,classifyId) values(?,?,?,?,?)";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramtcl);
		if (rows.affectedRows == 1){
			ctx.body = __newMsg(1, 'ok', rows);
		}

		return ctx;
	});
	return co;
};

//修改收藏状态
_rotr.apis.changeSave = function () {
	var ctx = this;
	var co = $co(function* () {
		var state = ctx.query.state || ctx.request.body.state;
		var themeId = ctx.query.themeId || ctx.request.body.themeId;
		var userId = ctx.query.userId || ctx.request.body.userId;
		var classifyId=ctx.query.classifyId||ctx.request.body.classifyId;
		var sqlstr;
		if(state==0){
			sqlstr = "select * from save where saveThemeId="+themeId+" and saveUserId="+userId+";";
		}
		else if(state==1){
			sqlstr = "insert into save(saveThemeId,saveUserId,classifyId) values("+themeId+","+userId+","+classifyId+");";
		}
		else{
			sqlstr = "delete from save where saveThemeId="+themeId+" and saveUserId="+userId+";";
		}
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(state==0&&rows.length==1){
			ctx.body =__newMsg(1, 'ok');
		}
		else if(state==0&&rows.length!=1){
			ctx.body =__newMsg(1, 'no');
		}
		else if(state!=0&&rows.affectedRows==1){
			ctx.body =__newMsg(1, 'ok');
		}
		else{
			ctx.body =__newMsg(1, 'waite');
		}
		return ctx;
	});
	return co;
};

//获取个人主页基本信息
_rotr.apis.getPersonalMsg = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var sqlstr='select count(*) as countDatas from save where saveUserId='+userId+'  UNION' +
			' select count(*)  from theme where themeUserId='+userId+' UNION' +
		    ' select count(*)  from histroy where hisUserId='+userId+';';
		var sqlstr2='select count(*) as countDatas  from star where starUserId='+userId+' ';
		 var sqlstr3=' select count(*) as countDatas from star where staredUserId='+userId+';';
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		var rows2 = yield _ctnu([_Mysql.conn, 'query'], sqlstr2);
		var rows3 = yield _ctnu([_Mysql.conn, 'query'], sqlstr3);
		if(rows){
			ctx.body = __newMsg(1, 'ok', {rows:rows,rows2:rows2,rows3:rows3});
		}
		return ctx;
	});
	return co;
};

//修改点赞状态
_rotr.apis.changeThumb = function () {
	var ctx = this;
	var co = $co(function* () {
		var state = ctx.query.state || ctx.request.body.state;
		var themeId = ctx.query.themeId || ctx.request.body.themeId;
		var userId = ctx.query.userId || ctx.request.body.userId;
		var authorId = ctx.query.authorId || ctx.request.body.authorId;
		var classifyId=ctx.query.classifyId||ctx.request.body.classifyId;
		var sqlstr;
		if(state==0){
			sqlstr = "select * from thumb where thumbThemeId="+themeId+" and thumbUserId="+userId+";";
		}
		else if(state==1){
			sqlstr = "insert into thumb(thumbThemeId,thumbUserId,authorId,classifyId) values("+themeId+","+userId+","+authorId+","+classifyId+");";
		}
		else{
			sqlstr = "delete from thumb where thumbThemeId="+themeId+" and thumbUserId="+userId+";";
		}
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(state==0&&rows.length==1){
			ctx.body =__newMsg(1, 'ok');
		}
		else if(state==0&&rows.length!=1){
			ctx.body =__newMsg(1, 'no');
		}
		else if(state!=0&&rows.affectedRows==1){
			ctx.body =__newMsg(1, 'ok');
		}
		else{
			ctx.body =__newMsg(1, 'waite');
		}
		return ctx;
	});
	return co;
};


_rotr.apis.getPersonBase = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var	sqlstr = "SELECT * from user where userId="+userId+";";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		ctx.body = __newMsg(1, 'ok', {rows:rows});
		return ctx;
	});
	return co;
};
//修改用户信息
_rotr.apis.changeMyUserMsg1 = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var userName = ctx.query.userName || ctx.request.body.userName;
		var sex = ctx.query.sex || ctx.request.body.sex;
		var realName = ctx.query.realName || ctx.request.body.realName;
		var userPhone = ctx.query.userPhone || ctx.request.body.userPhone;
		var sign = ctx.query.sign || ctx.request.body.sign;
		var description = ctx.query.description || ctx.request.body.description;
		var sqlstr='update user set userName=?,sex=?,realName=?,userPhone=?,sign=?,description=? where userId=?;';
		var paramtcl=[userName,sex,realName,userPhone,sign,description,userId];
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramtcl);
		if (rows.affectedRows==1) {
			ctx.body = __newMsg(1, 'ok');
		}
		return ctx;
	});
	return co;
};
//浏览历史
_rotr.apis.setHistroy = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var themeId = ctx.query.themeId || ctx.request.body.themeId;
		var	sqlstr = "SELECT * from histroy where hisUserId="+userId+" and hisThemeId="+themeId+";";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(rows.length==1){
			var	sqlstr1 = "update histroy set hisUserId="+userId+" where hisUserId="+userId+" and hisThemeId="+themeId+";";
			 yield _ctnu([_Mysql.conn, 'query'], sqlstr1);
		}
		else{
			var	sqlstr2 = "insert into histroy(hisUserId,hisThemeId) values("+userId+","+themeId+")";
			yield _ctnu([_Mysql.conn, 'query'], sqlstr2);
		}
		ctx.body = __newMsg(1, 'ok');
		return ctx;
	});
	return co;
};


_rotr.apis.getPersonalBrowser = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var	sqlstr = "select themeId,themeTitle,classifyText,classifyId,DATE_FORMAT(histroyTime, '%Y-%c-%d %T' ) as add_date from classify INNER JOIN (select themeId,themeTitle,themeClassify,histroyTime from theme  INNER JOIN" +
			" (select * from histroy where hisUserId="+userId+") h where h.hisThemeId=theme.themeId) a where classify.classifyId=a.themeClassify order by add_date desc;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		ctx.body = __newMsg(1, 'ok',rows);
		return ctx;
	});
	return co;
};

_rotr.apis.getPersonalSave = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var sqlstr = "select userName,userImg,themeId,themeTitle,classifyId,ThemeDesc,DATE_FORMAT(addTime, '%Y-%c-%d %T' ) as add_date from user INNER JOIN" +
			" (select * from theme INNER JOIN (select * from save where saveUserId="+userId+") s where" +
			" theme.themeId=s.saveThemeId) a where `user`.userId=a.themeUserId;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(rows.length>0){
			ctx.body = __newMsg(1, 'ok', {rows:rows});
		}
		else{
			ctx.body = __newMsg(1, 'none');
		}
		return ctx;
	});
	return co;
};
//获取其他用户信息
_rotr.apis.getOtherUserMsg = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var sqlstr = "select * from user where userId="+userId+";";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
			ctx.body = __newMsg(1, 'ok', {rows:rows});
		return ctx;
	});
	return co;
};

//关注
_rotr.apis.getCareInit = function () {
	var ctx = this;
	var co = $co(function* () {
		var state = ctx.query.state || ctx.request.body.state;
		var userId = ctx.query.userId || ctx.request.body.userId;
		var careUserId=ctx.query.careUserId || ctx.request.body.careUserId;
		var sqlstr,rows;
		if(state==0){
			sqlstr = "select * from star where starUserId="+userId+" and staredUserId="+careUserId+";";
		var	sqlstr2=' select count(*) as countDatas from star where starUserId='+careUserId+';';
		var	sqlstr3=' select count(*) as countDatas  from star where staredUserId='+careUserId+';';
			 rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
			var rows2=yield _ctnu([_Mysql.conn, 'query'], sqlstr2);
			var rows3=yield _ctnu([_Mysql.conn, 'query'], sqlstr3);
			if(rows.length>0){
				ctx.body = __newMsg(1, 'ok',{rows2:rows2,rows3:rows3});
			}
			else{
				ctx.body = __newMsg(1, 'none',{rows2:rows2,rows3:rows3});
			}
		}
		else if(state==1){
			sqlstr = "insert into star(starUserId,staredUserId) values("+userId+","+careUserId+");";
			 rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
			if(rows.affectedRows==1){
				ctx.body = __newMsg(1, 'ok');
			}
			else{
				ctx.body = __newMsg(1, 'no');
			}
		}
		else{
			sqlstr = "delete from  star where starUserId="+userId+" and staredUserId="+careUserId+";";
			rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
			if(rows.affectedRows==1){
				ctx.body = __newMsg(1, 'ok');
			}
			else{
				ctx.body = __newMsg(1, 'no');
			}
		}
		return ctx;
	});
	return co;
};
_rotr.apis.getPersonalCare = function () {
	var ctx = this;
	var co = $co(function* () {
		var state = ctx.query.state || ctx.request.body.state;
		var sqlstr;
		var userId = ctx.query.userId || ctx.request.body.userId;
		if(state==0){
			 sqlstr = "select * from user inner join (select * from star where starUserId="+userId+") u where " +
				 " user.userId=u.starUserId;";
		}
	   else{
			sqlstr = "select * from user inner join (select * from star where staredUserId="+userId+") u where " +
				" user.userId=u.starUserId;";
		}
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		ctx.body = __newMsg(1, 'ok', {rows:rows});
		return ctx;
	});
	return co;
};

_rotr.apis.deleteTheme = function () {
	var ctx = this;
	var co = $co(function* () {
		var themeId = ctx.query.themeId || ctx.request.body.themeId;
		var sqlstr = "delete from theme where themeId="+themeId+"";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(rows.affectedRows==1){
			ctx.body = __newMsg(1, 'ok');
		}
		else{
			ctx.body = __newMsg(1, 'no');
		}
		return ctx;
	});
	return co;
};
_rotr.apis.getAllUser = function () {
	var ctx = this;
	var co = $co(function* () {
		var sqlstr = "select *  from user";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(rows.length>0){
			ctx.body = __newMsg(1, 'ok',{rows:rows});
		}
		else{
			ctx.body = __newMsg(1, 'no');
		}
		return ctx;
	});
	return co;
};

_rotr.apis.sendNews = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var sendUserId = ctx.query.sendUserId || ctx.request.body.sendUserId;
		var content = ctx.query.content || ctx.request.body.content;
		var paramtc=[userId,sendUserId,content];
		var sqlstr = "insert into news(newsUserId,newsSendUserId,newsContent) values(?,?,?)";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr,paramtc);
		if(rows.affectedRows==1){
			ctx.body = __newMsg(1, 'ok');
		}
		else{
			ctx.body = __newMsg(1, 'no');
		}
		return ctx;
	});
	return co;
};

_rotr.apis.getNewsMsg = function () {
	var ctx = this;
	var co = $co(function* () {
		var userId = ctx.query.userId || ctx.request.body.userId;
		var sqlstr="select userName,themeTitle,themeClassify,thumbUserId,thumbId,DATE_FORMAT(thumbTime, '%Y-%c-%d %T' ) as add_date,classifyText from  classify INNER JOIN (select userName,themeTitle,themeClassify,thumbUserId,thumbId,thumbTime from user INNER JOIN (select themeTitle,themeClassify,thumbUserId,thumbId,thumbTime from theme INNER JOIN" +
			" (select * from thumb where authorId="+userId+") th where theme.themeId=th.thumbThemeId) a where `user`.userId=a.thumbUserId) b WHERE" +
			" classify.classifyId=b.themeClassify order by add_date desc;";
		var sqlstr2="select userName,userImg,userId,newsId,newsContent,DATE_FORMAT(sendTime, '%Y-%c-%d %T' ) as add_date from user INNER JOIN" +
			" (select * from news where newsSendUserId="+userId+") n where user.userId=n.newsUserId order by add_date desc;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		var rows2 = yield _ctnu([_Mysql.conn, 'query'], sqlstr2);
		if (rows.length>0) {
			ctx.body = __newMsg(1, 'ok',{rows:rows,rows2:rows2});
		}
		return ctx;
	});
	return co;
};
_rotr.apis.deleteNews = function () {
	var ctx = this;
	var co = $co(function* () {
		var newsId=ctx.query.newsId||ctx.request.body.newsId;
		var sqlstr = "delete from news where newsId="+newsId+"";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(rows.affectedRows==1){
			ctx.body = __newMsg(1, 'ok');
		}
		else{
			ctx.body = __newMsg(1, 'no');
		}
		return ctx;
	});
	return co;
};
_rotr.apis.getTopIndex = function () {
	var ctx = this;
	var co = $co(function* () {
		var sqlstr = "select userId,userName,userImg,topIndex from user INNER JOIN (" +
			"select themeUserId,count(*) as topIndex from theme GROUP BY themeUserId) a where " +
			" user.userId=a.themeUserId order by topIndex desc LIMIT 0,3;";
		var rows = yield _ctnu([_Mysql.conn, 'query'], sqlstr);
		if(rows.length>0){
			ctx.body = __newMsg(1, 'ok',{rows:rows});
		}
		else{
			ctx.body = __newMsg(1, 'no');
		}
		return ctx;
	});
	return co;
};

//导出模块
module.exports = _rotr;