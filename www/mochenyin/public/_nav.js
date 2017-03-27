console.log('>>>>1222222');
var userid;
app.controller('myc', function ($scope) {
		$.get('/../../start/api/getMyInfo', function (res) {
			$scope.$apply(function () {
				$scope.userinfo = {
					nick: res.data['nick'],
					userid: res.data['id']
				}
				userid = res.data['id']
				console.log('>>>>12', res.data['nick']);
				var dat = {
					userid: res.data['id']
				}
				$.get('/homework/api/userimg', dat, function (res) {
					console.log(">>>>userimg", res.data.img['img']);
					$('#img').attr('src', res.data.img['img']);
				})


			})
		})
	})
	//	侧边栏样式，动画设置
$(function () {
	$('.height').css({
		height: screen.scrollHeight
	});
	$('#drawer').css({
		hight: screen.scrollHeight,
		width: screen.scrollWidth
	});
	$('#pull').click(function () {

		$('#drawer').css({
			display: 'block'
		});
		$('#drawer1').animate({
			left: 0
		}, 'slow')
	});
	$('#drawer').click(function () {
		$('#drawer').css({
			display: 'none'
		})
		$('#drawer1').animate({
			left: -80 + '%'
		})

	});
	$('#img').click(function () {
		_fns.uploadFile2($('#img'), function (f) {

		}, function (f) {

		}, function (f) {
			console.log('>>>>success2:', f);
			var dat = {
				userid: userid,
				src: f.url
			}
			$.post('/homework/api/upUserimg', dat, function (res) {
				console.log(">>>>", res);
				$('#img').attr('src', f.url);
			})
		});
	});
});
