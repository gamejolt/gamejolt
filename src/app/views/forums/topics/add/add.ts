import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { ForumChannel } from '../../../../../_common/forum/channel/channel.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
import { showInfoGrowl } from '../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import FormForumTopic from '../../../../components/forms/forum/topic/topic.vue';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumRules from '../../../../components/forum/rules/rules.vue';
import AppPageHeader from '../../../../components/page-header/page-header.vue';

@Options({
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
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

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
			showInfoGrowl(
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
