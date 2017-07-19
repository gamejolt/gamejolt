// const router = angular
// 	.module('App.Views.Dashboard')
// 	.controller('Dashboard.Account.LinkedAccountsCtrl', function(
// 		$scope,
// 		$state,
// 		App,
// 		Growls,
// 		UserLinkedAccounts,
// 		Youtube_Channel,
// 		User_SetPasswordModal,
// 		ModalConfirm,
// 		gettextCatalog,
// 		payload
// 	) {
// 		var _this = this;

// 		$scope.App.title = 'Linked Accounts';
// 		$scope.accountCtrl.heading = 'Linked Accounts';

// 		this.channels = Youtube_Channel.populate(payload.channels);

// 		this.link = function(provider) {
// 			// TODO: Make sure app.router exists.
// 			UserLinkedAccounts.link(App.router, provider);
// 		};

// 		this.unlink = function(provider) {
// 			UserLinkedAccounts.unlink(App.user, provider).catch(function(error) {
// 				// If they don't have a password, we have to show them a modal to set it.
// 				if (error === 'no-password') {
// 					User_SetPasswordModal.show().then(function() {
// 						Growls.success(
// 							'Your new password has been set. You can now log in with it.',
// 							'Password Set'
// 						);

// 						// Try to unlink again once they've set one!
// 						_this.unlink(provider);
// 					});
// 				}
// 			});
// 		};

// 		this.unlinkYoutube = function(channel) {
// 			ModalConfirm.show(
// 				gettextCatalog.getString(
// 					'Are you you want to unlink this channel? Any videos you may have done as part of this channel will be removed from Game Jolt.'
// 				)
// 			)
// 				.then(function() {
// 					return channel.$remove();
// 				})
// 				.then(function() {
// 					_.remove(_this.channels, { id: channel.id });
// 				});
// 		};

// 		this.youtubeChannelLinked = function(channel) {
// 			this.channels.push(new Youtube_Channel(channel));
// 		};
// 	});

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html?style=./list.styl';

import { RouteResolve } from '../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteMutation, RouteStore } from '../../account.state';
import { YoutubeChannel } from '../../../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { ModalConfirm } from '../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { arrayRemove } from '../../../../../../lib/gj-lib-client/utils/array';
import { UserSetPasswordModal } from '../../../../../components/user/set-password-modal/set-password-modal.service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppState, AppStore } from '../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import {
	UserLinkedAccounts,
	Provider,
} from '../../../../../../lib/gj-lib-client/components/user/linked-accounts/linked-accounts.service';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export default class RouteDashAccountLinkedAccountsList extends Vue {
	@AppState user: AppStore['user'];
	@RouteMutation setHeading: RouteStore['setHeading'];

	channels: YoutubeChannel[] = [];

	@RouteResolve()
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/linked-accounts');
	}

	routed() {
		Meta.title = 'Linked Accounts';
		this.setHeading('Linked Accounts');

		this.channels = YoutubeChannel.populate(this.$payload.channels);
	}

	getProviderIcon(provider: Provider) {
		switch (provider) {
			case 'facebook':
				return 'facebook';
			case 'twitter':
				return 'twitter-bird';
			case 'google':
				return 'google-plus';
			case 'twitch':
				return 'twitch';
		}
	}

	link(provider: Provider) {
		UserLinkedAccounts.link(this.$router, provider);
	}

	async unlink(provider: Provider) {
		if (!this.user) {
			return;
		}

		try {
			await UserLinkedAccounts.unlink(this.user, provider);
		} catch (error) {
			// If they don't have a password, we have to show them a modal to set it.
			if (error === 'no-password') {
				const result = await UserSetPasswordModal.show();
				if (!result) {
					return;
				}

				Growls.success(
					this.$gettext('Your new password has been set. You can now log in with it.'),
					this.$gettext('Password Set')
				);

				// Try to unlink again once they've set one!
				await this.unlink(provider);
			}
			// TODO(rewrite): proper fail case?
		}
	}

	async unlinkYoutube(channel: YoutubeChannel) {
		const result = await ModalConfirm.show(
			this.$gettext(
				'Are you you want to unlink this channel? Any videos you may have done as part of this channel will be removed from Game Jolt.'
			)
		);

		if (!result) {
			return;
		}

		await channel.$remove();
		arrayRemove(this.channels, _channel => _channel.id === channel.id);
	}

	youtubeChannelLinked(channelData: any) {
		this.channels.push(new YoutubeChannel(channelData));
	}
}
