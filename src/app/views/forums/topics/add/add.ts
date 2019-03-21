import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { ForumChannel } from 'game-jolt-frontend-lib/components/forum/channel/channel.model';
import { ForumTopic } from 'game-jolt-frontend-lib/components/forum/topic/topic.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import FormForumTopic from '../../../../components/forms/forum/topic/topic.vue';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumRules from '../../../../components/forum/rules/rules.vue';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { Store } from '../../../../store/index';

@Component({
	name: 'RouteForumsTopicsAdd',
	components: {
		AppPageHeader,
		AppUserAvatar,
		AppForumBreadcrumbs,
		AppForumRules,
		FormForumTopic,
	},
})
@RouteResolver({
	deps: { params: ['channel'] },
	resolver: ({ route }) => Api.sendRequest('/web/forums/topics/create/' + route.params.channel),
})
export default class RouteForumsTopicsAdd extends BaseRouteComponent {
	@State
	app!: Store['app'];

	channel: ForumChannel = null as any;

	get routeTitle() {
		return this.$gettext(`Create a New Topic`);
	}

	routeResolved($payload: any) {
		this.channel = new ForumChannel($payload.channel);
	}

	onCreated(formModel: ForumTopic) {
		// If their post was marked as spam, make sure they know.
		if (formModel.status === ForumTopic.STATUS_SPAM) {
			Growls.info(
				this.$gettext(
					`Your topic has been marked for review. Please allow some time for it to show on the site.`
				),
				this.$gettext(`Topic Needs Review`)
			);
		}

		this.$router.push({
			name: 'forums.channels.view',
			params: { name: this.channel.name, sort: 'active' },
		});
	}
}
