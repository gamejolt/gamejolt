angular.module( 'App.Views' ).config( function( $stateProvider )
{   
    $stateProvider.state( 'forums.category', {
        url: '/forums/category/:categoryName',
        controller: 'Forums.CategoryCtrl',
        controllerAs: 'categoryCtrl',
        templateUrl: '/app/views/forums/category/category.html',
    } );
} );