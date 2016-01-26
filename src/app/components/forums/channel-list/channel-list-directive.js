angular.module( 'App.Forums.ChannelList' ).directive( 'gjForumsChannelList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forums/channel-list/channel-list.html',
		scope: {
			items: '=items',
			moreLink: '@moreLink',
			listType: '@listType'
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope ) {}
	}
} );
