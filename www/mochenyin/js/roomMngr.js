/**
 * Created by SWSD on 2017-03-29.
 */
/**
 * Created by SWSD on 2017-03-15.
 */
function startRoomMngrController($scope){
    $.get('/api/getAllRoomMngr',function(res){
        $scope.$apply(function () {
            $scope.filteredNotes = [], $scope.currentPage = 1, $scope.numPerPage =10 , $scope.maxSize = 3;
            $scope.notice = res.data;
            $scope.length = Math.ceil(res.data.length / $scope.numPerPage);
            var items=[];
            for(var i=1;i<=$scope.length;i++){
                items.push({i});
            }
            $scope.items=items;
            $scope.$watch('currentPage + numPerPage', function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage),
                    end = begin + $scope.numPerPage;
                $scope.filteredNotes = $scope.notice.slice(begin, end);

            });
            $scope.page=function(){
                $scope.currentPage = this.v.i;
                let num=this.v.i-1;
                $('.clickLi').removeClass('active');
                $('.clickLi:eq("'+num+'")').addClass('active');
                if($scope.currentPage==1){
                    $('.previous').addClass('disabled')
                }
                else if($scope.currentPage==$scope.length){
                    $('.next').addClass('disabled')
                }
                else{
                    $('.next').removeClass('disabled');
                    $('.previous').removeClass('disabled')
                }
            };
            $scope.prePage=function(){
                $('.next').removeClass('disabled');
                if($scope.currentPage>1){
                    $scope.currentPage=$scope.currentPage-1;
                    let num=$scope.currentPage-1;
                    console.log(num);
                    $('.clickLi').removeClass('active');
                    $('.clickLi:eq("'+num+'")').addClass('active');
                    if($scope.currentPage==2){
                        $('.previous').addClass('disabled')
                    }
                }
            };
            $scope.nextPage=function(){
                $('.previous').removeClass('disabled');
                if($scope.currentPage<$scope.length){
                    let num=$scope.currentPage-0;
                    console.log($scope.currentPage);
                    $scope.currentPage=$scope.currentPage+1;
                    $('.clickLi').removeClass('active');
                    $('.clickLi:eq("'+num+'")').addClass('active');
                    if($scope.currentPage==$scope.length-1){
                        $('.next').addClass('disabled');
                    }
                }
            };
        });

        $scope.delete = function (roomId) {
            var dat = {
                nid: roomId
            }
            var a = confirm("您确定要删除吗？");
            if (a) {
                var a = $scope.filteredNotes.splice($.inArray(this.v, $scope.filteredNotes), 1);
                $.post("/api/deleteRoom", dat, function (res) {
                    if(res.text=='ok'){
                        alert('删除成功')
                    }
                });
            };
        }
    })
}

