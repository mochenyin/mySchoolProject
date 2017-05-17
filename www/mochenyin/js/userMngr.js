/**
 * Created by SWSD on 2017-03-06.
 */
function startUserMngrController($scope){
    console.log(sessionStorage.role);
    $.get('/api/getUserMngr',{role:0},function(res) {
        $scope.$apply(function () {
            $scope.filteredNotes = [], $scope.currentPage = 1, $scope.numPerPage = 10 , $scope.maxSize = 3;
            $scope.notice = res.data;
            $scope.length = Math.ceil(res.data.length / $scope.numPerPage);
            var items = [];
            for (var i = 1; i <= $scope.length; i++) {
                items.push({i});
            }
            $scope.items = items;
            $scope.$watch('currentPage + numPerPage', function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage),
                    end = begin + $scope.numPerPage;
                $scope.filteredNotes = $scope.notice.slice(begin, end);

            });
            $scope.page = function () {
                $scope.currentPage = this.v.i;
                let num = this.v.i - 1;
                $('.clickLi').removeClass('active');
                $('.clickLi:eq("' + num + '")').addClass('active');
                if ($scope.currentPage == 1) {
                    $('.previous').addClass('disabled')
                }
                else if ($scope.currentPage == $scope.length) {
                    $('.next').addClass('disabled')
                }
                else {
                    $('.next').removeClass('disabled');
                    $('.previous').removeClass('disabled')
                }
            };
            $scope.prePage = function () {
                $('.next').removeClass('disabled');
                if ($scope.currentPage > 1) {
                    $scope.currentPage = $scope.currentPage - 1;
                    let num = $scope.currentPage - 1;
                    console.log(num);
                    $('.clickLi').removeClass('active');
                    $('.clickLi:eq("' + num + '")').addClass('active');
                    if ($scope.currentPage == 2) {
                        $('.previous').addClass('disabled')
                    }
                }
            };
            $scope.nextPage = function () {
                $('.previous').removeClass('disabled');
                if ($scope.currentPage < $scope.length) {
                    let num = $scope.currentPage - 0;
                    console.log($scope.currentPage);
                    $scope.currentPage = $scope.currentPage + 1;
                    $('.clickLi').removeClass('active');
                    $('.clickLi:eq("' + num + '")').addClass('active');
                    if ($scope.currentPage == $scope.length - 1) {
                        $('.next').addClass('disabled');
                    }
                }
            };
        });
    });
    $.get('/api/getUserMngr',{role:1},function(data1){
       $scope.$apply(function(){
           $scope.filteredNotes1=data1.data;
       })
    });
    $.get('/api/getUserMngr',{role:2},function(data2){
        $scope.$apply(function(){
            $scope.filteredNotes2=data2.data;
        })
});
    $scope.selOptions=[{key:0,value:'普通用户'},{key:1,value:'管理员'},{key:2,value:'超级管理员'}];
    $scope.selectChange=function(selValue,role,userId){//修改用户角色
       if((sessionStorage.role==1&&role==0)||(sessionStorage.role==2&&role==0)){
            if(sessionStorage.role==1&&selValue.key==2){
                alert('您的权限不足')//管理员只能对普通用户进行管理，并且无权限涉及到超级管理员层面
            }
           else{
                let name=selValue.key==2?'超级管理员':'管理员';
                var b = confirm("您确定要将该用户设为"+name+"吗？");
                if (b) {
                    $.post("/api/changeUserRole", {userId:userId,role:selValue.key}, function (res) {
                        if (res.text == 'ok') {
                             alert('操作成功');
                            $scope.filteredNotes.splice($.inArray(this.v, $scope.filteredNotes), 1);
                        }
                    });
                }
            }
       }
        else{
           if(sessionStorage.role==2&&role==1){//超级管理员可对所有网站用户进行管理及权限修改
                let name=selValue.key==0?'普通用户':'超级管理员';
               var c = confirm("您确定要将该用户设为"+name+"吗？");
               if (c) {
                   $.post("/api/changeUserRole", {userId:userId,role:selValue.key}, function (res) {
                       if (res.text == 'ok') {
                           alert('操作成功');
                       }
                   });
               }
           }
           else if(sessionStorage.role==2&&role==2){
               let name=selValue.key==0?'普通用户':'管理员';
               var d = confirm("您确定要将该用户设为"+name+"吗？");
               if (d) {
                   $.post("/api/changeUserRole", {userId:userId,role:selValue.key}, function (res) {
                       if (res.text == 'ok') {
                           alert('操作成功')
                       }
                   });
               }
           }
           else{
               alert('您的权限不足')
           }
       }
    };
    $scope.delete = function (userId,role) {
        var dat = {
            userId: userId
        };

        if((sessionStorage.role==1&&role==0)||(sessionStorage.role==2&&(role==1||role==0))){
            var a = confirm("您确定要删除吗？");
            if (a) {
                $scope.filteredNotes.splice($.inArray(this.v, $scope.filteredNotes), 1);
                $.post("/api/deleteUser", dat, function (res) {
                    if (res.text == 'ok') {
                        alert('删除成功')
                    }
                });
            }
        }
      else{
            alert('您的权限不足')
        }
    };
}