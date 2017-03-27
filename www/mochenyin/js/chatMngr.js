/**
 * Created by SWSD on 2017-03-15.
 */
function startChatMngrController($scope){
    $.get('/api/getAllChatMngr',function(res){
        $scope.$apply(function () {
            $scope.filteredNotes = [], $scope.currentPage = 1, $scope.numPerPage = 10, $scope.maxSize = 3;
            $scope.notice = res.data;
            $scope.length = Math.ceil(res.data.length / $scope.numPerPage);
            var items=[];
            for(var i=1;i<=$scope.length;i++){
                items.push({i});
            }
            $scope.items=items;
            console.log($scope.length);
            $scope.$watch('currentPage + numPerPage', function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage),
                    end = begin + $scope.numPerPage;
                $scope.filteredNotes = $scope.notice.slice(begin, end);

            });
            $scope.page=function(){
                $scope.currentPage = this.v.i;
            };
            $scope.delete = function (roomId) {
                var dat = {
                    nid: roomId
                }
                var a = confirm("您确定要删除吗？");
                if (a) {
                    var a = $scope.filteredNotes.splice($.inArray(this.v, $scope.filteredNotes), 1);
                    $.post("/api/deleteChat", dat, function (res) {
                        if(res.text=='ok'){
                            alert('删除成功')
                        }
                    });
                };
            }

        })
    })
}

