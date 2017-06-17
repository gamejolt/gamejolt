angular
	.module('App.Forms.Dashboard')
	.directive('gjFormDashboardGameKeyGroupAddKeys', function(
		Form,
		KeyGroup,
		Api,
	) {
		var form = new Form({
			template: require('./add-keys.html'),
		});

		form.scope.keyGroup = '=';

		form.onInit = function(scope) {
			scope.KeyGroup = KeyGroup;
		};

		form.onSubmit = function(scope) {
			return Api.sendRequest(
				'/web/dash/developer/games/key-groups/add-keys/' +
					scope.keyGroup.game_id +
					'/' +
					scope.keyGroup.id,
				scope.formModel,
			);
		};

		return form;
	});
