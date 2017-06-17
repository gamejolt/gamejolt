angular.module('App.Client.Intro').directive('gjClientIntro', function() {
	return {
		restrict: 'E',
		scope: {
			clientIntroDone: '&?',
		},
		template: require('!html-loader!./intro.html'),
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function(
			$document,
			$scope,
			$q,
			$element,
			$transition,
			$timeout,
			App,
			Client,
			Connection
		) {
			var _this = this;

			this.shouldShowLoading = false;

			function setAnim(element, className, type) {
				type = type == 'transition' ? 'transitionend' : 'animationend';

				return $q(function(resolve, reject) {
					function endHandler() {
						element.unbind(type, endHandler);
						resolve(element);
					}

					element.bind(type, endHandler);
					element.addClass(className);
				});
			}

			function showLogo() {
				var img = new Image(328, 36);
				img.src = require('./intro.gif');
				img.className = 'client-intro-logo';

				var $wrapper = angular.element(
					$element[0].getElementsByClassName('client-intro-wrap')[0]
				);
				$wrapper.append(img);
			}

			function playSound(file) {
				return $q(function(resolve, reject) {
					var audio = new Audio(file);
					audio.volume = 0.15;
					var element = angular.element(audio);

					function playHandler() {
						element.unbind('play', playHandler);
						resolve();
					}

					element.bind('play', playHandler);
					audio.play();
				});
			}

			function finish() {
				$document[0].body.classList.remove('client-intro-no-overflow');
				_this.clientIntroDone({});
			}

			$document[0].body.classList.add('client-intro-no-overflow');

			var initialStateChange = $q.defer();
			var loadingShowPromise = null;

			// Whatever happens first.
			// The page loaded or the connection is gone.
			$scope.$on('$stateChangeSuccess', function() {
				initialStateChange.resolve();
			});

			$scope.$watch(function() {
				if (!Connection.isOnline) {
					initialStateChange.resolve();
				}
			});

			$timeout(function() {
				// We only show the intro if they're logged in.
				// Otherwise we just keep everything hidden and wait for the Client_User service to redirect.
				// When we first log in, we don't have a user many times since the first payload hasn't gotten to us.
				// We set the `client-intro-login-play` value through log in and catch it here to make sure we play anyway.
				if (!App.user && !sessionStorage.getItem('client-intro-login-play')) {
					return;
				}

				// Only play once per session.
				// This fixes issues when the client auto-updates and it has to refresh the app.
				if (sessionStorage.getItem('client-intro-has-played')) {
					finish();
					return;
				}

				// If we started silently (through autostart with computer start), then we don't want to play the intro
				// since it'll be in the background. However, if they started it up silently and are now logging in,
				// let's play the intro since they had to manually bring the client forward to do that.
				if (
					Client.startedSilently &&
					!sessionStorage.getItem('client-intro-login-play')
				) {
					finish();
					return;
				}

				// Be sure to set that we've played.
				sessionStorage.setItem('client-intro-has-played', 'played');

				$q
					.resolve()
					.then(function() {
						return playSound(require('./intro.ogg'));
					})
					.then(function() {
						// The sound effect/anim takes about 1.6s
						showLogo();
						return $timeout(1600);
					})
					.then(function() {
						// We want to show a "loading" message after a bit of waiting.
						// If it hasn't loaded the homepage by the time the intro has finished, they probably have a slow connection.
						loadingShowPromise = $timeout(1000).then(function() {
							_this.shouldShowLoading = true;
						});

						// We do the leave animation as soon as the initial state has come into
						// view behind this intro anim.
						return initialStateChange.promise;
					})
					.then(function() {
						$timeout.cancel(loadingShowPromise);
						_this.shouldShowLoading = false;
						return setAnim($element, 'client-intro-leave', 'transition');
					})
					.then(function() {
						finish();
					});
			});
		},
	};
});
