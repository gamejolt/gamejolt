angular
	.module('App.Client.User')
	.run(function($rootScope, Client_User) {
		Client_User.init();
	})
	.service('Client_User', function(
		$window,
		$rootScope,
		Environment,
		App,
		User
	) {
		var _this = this;

		this.init = function() {
			$rootScope.$on('Payload.userProcessed', function() {
				_this.checkPayloadUser();
			});

			// We bootstrap the client with the previously stored user if there was any.
			// This way they can access client offline with their previous user.
			var localUser = localStorage.getItem('user');
			if (localUser) {
				App.user = new User(JSON.parse(localUser));

				// Gotta fake a userProcessed event so that anything that watches that gets notified.
				$rootScope.$emit('Payload.userProcessed', true);
			}
		};

		this.checkPayloadUser = function() {
			if (App.user) {
				localStorage.setItem('user', JSON.stringify(App.user));
			} else {
				localStorage.removeItem('user');

				// If they're logged out in client, we have to force to auth page..
				authRedirect();
			}
		};

		function authRedirect() {
			$window.location.href = Environment.authBaseUrl + '/login';
		}
	});
