import { Component } from 'vue-property-decorator';
import View from '!view!./list.html?style=./list.styl';

import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { RouteMutation, RouteStore } from '../../account.store';
import { YoutubeChannel } from '../../../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { ModalConfirm } from '../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { arrayRemove } from '../../../../../../lib/gj-lib-client/utils/array';
import { UserSetPasswordModal } from '../../../../../components/user/set-password-modal/set-password-modal.service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppState, AppStore } from '../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';
import {
	UserLinkedAccounts,
	Provider,
} from '../../../../../../lib/gj-lib-client/components/user/linked-accounts/linked-accounts.service';

@View
@Component({
	name: 'RouteDashAccountLinkedAccountsList',
	components: {
		AppJolticon,
	},
})
export default class RouteDashAccountLinkedAccountsList extends BaseRouteComponent {
	@AppState user!: AppStore['user'];
	@RouteMutation setHeading!: RouteStore['setHeading'];

	channels: YoutubeChannel[] = [];

	@RouteResolve()
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/linked-accounts');
	}

	get routeTitle() {
		return this.$gettext('Linked Accounts');
	}

	routed($payload: any) {
		this.setHeading(this.$gettext('Linked Accounts'));
		this.channels = YoutubeChannel.populate($payload.channels);
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
			// TODO: proper fail case?
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
