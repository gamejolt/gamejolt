import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import { RouteResolve } from '../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppState, AppStore } from '../../../../../../lib/gj-lib-client/vue/services/app/app-store';

@Component({})
export default class RouteDashAccountLinkedAccountsLinkCallback extends Vue {
	@AppState user: AppStore['user'];

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		// Force POST.
		if (route.params.provider === 'twitter') {
			return Api.sendRequest(
				'/web/dash/linked-accounts/link-callback/' +
					route.params.provider +
					'?oauth_verifier=' +
					route.query.oauth_verifier +
					'&state=' +
					route.query.state,
				{}
			);
		} else if (route.params.provider === 'facebook') {
			return Api.sendRequest(
				'/web/dash/linked-accounts/link-callback/' +
					route.params.provider +
					'?code=' +
					route.query.code +
					'&state=' +
					route.query.state,
				{}
			);
		} else if (route.params.provider === 'twitch') {
			return Api.sendRequest(
				'/web/dash/linked-accounts/link-callback/' +
					route.params.provider +
					'?code=' +
					route.query.code +
					'&state=' +
					route.query.state,
				{}
			);
		} else if (route.params.provider === 'google') {
			return Api.sendRequest(
				'/web/dash/linked-accounts/link-callback/' +
					route.params.provider +
					'?code=' +
					route.query.code +
					'&state=' +
					route.query.state,
				{}
			);
		} else if (route.params.provider === 'youtube-channel') {
			return Api.sendRequest(
				'/web/dash/linked-accounts/link-callback/' +
					route.params.provider +
					'?code=' +
					route.query.code +
					'&state=' +
					route.query.state,
				{}
			);
		}
	}

	routed() {
		if (!this.user) {
			return;
		}

		if (this.$route.params.provider === 'twitter') {
			if (!this.$payload.success) {
				if (this.$payload.reason && this.$payload.reason === 'account-taken') {
					Growls.error(
						this.$gettext('This Twitter account is already linked to another Game Jolt account.')
					);
				} else {
					Growls.error(this.$gettext('Unable to link your Twitter account.'));
				}
			} else {
				Growls.success(
					this.$gettextInterpolate('Your Twitter account (@%{ name }) has been linked.', {
						name: this.user.twitter_screenname,
					}),
					this.$gettext('Account Linked')
				);
			}
		} else if (this.$route.params.provider === 'facebook') {
			if (!this.$payload.success) {
				if (this.$payload.reason && this.$payload.reason === 'account-taken') {
					Growls.error(
						this.$gettext('This Facebook account is already linked to another Game Jolt account.')
					);
				} else {
					Growls.error(this.$gettext('Unable to link your Facebook account.'));
				}
			} else {
				Growls.success(
					this.$gettextInterpolate('Your Facebook account (%{ name }) has been linked.', {
						name: this.user.facebook_name,
					}),
					this.$gettext('Account Linked')
				);
			}
		} else if (this.$route.params.provider === 'twitch') {
			if (!this.$payload.success) {
				if (this.$payload.reason && this.$payload.reason === 'account-taken') {
					Growls.error(
						this.$gettext('This Twitch account is already linked to another Game Jolt account.')
					);
				} else {
					Growls.error(this.$gettext('Unable to link your Twitch account.'));
				}
			} else {
				Growls.success(
					this.$gettextInterpolate('Your Twitch account (%{ name }) has been linked.', {
						name: this.user.twitch_name,
					}),
					this.$gettext('Account Linked')
				);
			}
		} else if (this.$route.params.provider === 'google') {
			if (!this.$payload.success) {
				if (this.$payload.reason && this.$payload.reason === 'account-taken') {
					Growls.error(
						this.$gettext('This Google+ account is already linked to another Game Jolt account.')
					);
				} else {
					Growls.error(this.$gettext('Unable to link your Google+ account.'));
				}
			} else {
				Growls.success(
					this.$gettextInterpolate('Your Google+ account (%{ name }) has been linked.', {
						name: this.user.google_nickname,
					}),
					this.$gettext('Account Linked')
				);
			}
		} else if (this.$route.params.provider === 'youtube-channel') {
			if (!this.$payload.success) {
				if (!this.$payload.reason) {
					Growls.error(this.$gettext('Unable to link your YouTube channel.'));
				} else if (this.$payload.reason === 'channel-taken') {
					Growls.error(
						this.$gettext('This YouTube channel is already linked to another Game Jolt account.')
					);
				} else if (this.$payload.reason === 'not-public') {
					Growls.error(this.$gettext('This YouTube channel is not public.'));
				}
			} else {
				Growls.success(
					this.$gettext('Your YouTube channel has been linked.'),
					this.$gettext('YouTube Channel Linked')
				);
			}
		}

		this.$router.push({
			name: 'dash.account.linked-accounts.list',
		});
	}

	render(h: Vue.CreateElement) {
		return h('div');
	}
}
