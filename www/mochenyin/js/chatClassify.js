/**
 * Created by SWSD on 2017-03-13.
 */
function getChatClassify($scope,data){
    for(var val in data){
        if(data[val].roomImg=='none'){
            data[val].roomImg='Fi4IIuXEHudX40NOxXQr1FIkHXia';
        }
    }
   $scope.$apply(function(){
       $scope.chatClassifyList=data;
   });
    var $container = $('#chatList');
    $container.imagesLoaded(function() {
        $container.masonry({
            itemSelector: '.chatListRepeat',
            // gutter: 20,
            isAnimated: true,
        });
    });
}
