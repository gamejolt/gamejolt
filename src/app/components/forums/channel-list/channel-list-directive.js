angular.module( 'App.Forums.ChannelList' ).directive( 'gjForumsChannelList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forums/channel-list/channel-list.html',
		scope: {
			category: '=',
			channels: '=',
			listType: '@'
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	}
} );
