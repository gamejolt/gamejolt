angular
	.module('App.Client.HideOffline')
	.directive('gjClientHideOffline', function(Connection) {
		return {
			restrict: 'E',
			scope: true,
			transclude: true,
			template:
				'<div ng-if="!Connection.isClientOffline"><ng-transclude></ng-transclude></div>',
			link: function(scope) {
				scope.Connection = Connection;
			},
		};
	});
