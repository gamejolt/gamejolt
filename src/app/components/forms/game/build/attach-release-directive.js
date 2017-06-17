angular
	.module('App.Forms.Dashboard')
	.directive('gjFormDashboardGameBuildAttachRelease', function() {
		return {
			restrict: 'A',
			require: '^gjFormDashboardGameRelease',
			link: function(scope, element, attrs, releaseForm) {
				// We store all the build forms into the game release form.
				// This way when the release is saved, the builds can all be saved as well.
				releaseForm.buildForms[scope.baseModel.id] = form;

				scope.$on('$destroy', function() {
					delete releaseForm.buildForms[scope.baseModel.id];
				});
			},
		};
	});
