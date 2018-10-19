import View from '!view!./add.html';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { ForumChannel } from '../../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { FormForumTopic } from '../../../../components/forms/forum/topic/topic';
import { AppForumBreadcrumbs } from '../../../../components/forum/breadcrumbs/breadcrumbs';
import { AppForumRules } from '../../../../components/forum/rules/rules';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { Store } from '../../../../store/index';

@View
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
