import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./add.html';

import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { ForumChannel } from '../../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Store } from '../../../../store/index';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { AppUserAvatar } from '../../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppForumBreadcrumbs } from '../../../../components/forum/breadcrumbs/breadcrumbs';
import { AppForumRules } from '../../../../components/forum/rules/rules';
import { FormForumTopic } from '../../../../components/forms/forum/topic/topic';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

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
export default class RouteForumsTopicsAdd extends BaseRouteComponent {
	@State app: Store['app'];

	channel: ForumChannel = null as any;

	get routeTitle() {
		return this.$gettext(`Create a New Topic`);
	}

	@RouteResolve()
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/forums/topics/create/' + route.params.channel);
	}

	routed($payload: any) {
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
			params: { name: this.channel.name },
		});
	}
}
