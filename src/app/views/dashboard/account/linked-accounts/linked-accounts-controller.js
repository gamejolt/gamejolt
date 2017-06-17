const router = angular
	.module('App.Views.Dashboard')
	.controller('Dashboard.Account.LinkedAccountsCtrl', function(
		$scope,
		$state,
		App,
		Growls,
		UserLinkedAccounts,
		Youtube_Channel,
		User_SetPasswordModal,
		ModalConfirm,
		gettextCatalog,
		payload,
	) {
		var _this = this;

		$scope.App.title = 'Linked Accounts';
		$scope.accountCtrl.heading = 'Linked Accounts';

		this.channels = Youtube_Channel.populate(payload.channels);

		this.link = function(provider) {
			// TODO: Make sure app.router exists.
			UserLinkedAccounts.link(App.router, provider);
		};

		this.unlink = function(provider) {
			UserLinkedAccounts.unlink(App.user, provider).catch(function(error) {
				// If they don't have a password, we have to show them a modal to set it.
				if (error === 'no-password') {
					User_SetPasswordModal.show().then(function() {
						Growls.success(
							'Your new password has been set. You can now log in with it.',
							'Password Set',
						);

						// Try to unlink again once they've set one!
						_this.unlink(provider);
					});
				}
			});
		};

		this.unlinkYoutube = function(channel) {
			ModalConfirm.show(
				gettextCatalog.getString(
					'Are you you want to unlink this channel? Any videos you may have done as part of this channel will be removed from Game Jolt.',
				),
			)
				.then(function() {
					return channel.$remove();
				})
				.then(function() {
					_.remove(_this.channels, { id: channel.id });
				});
		};

		this.youtubeChannelLinked = function(channel) {
			this.channels.push(new Youtube_Channel(channel));
		};
	});
