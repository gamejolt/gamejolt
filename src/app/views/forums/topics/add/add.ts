import Vue from 'vue';
import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./add.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { BeforeRouteEnter } from '../../../../../lib/gj-lib-client/utils/router';
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

@View
@Component({
	components: {
		AppPageHeader,
		AppUserAvatar,
		AppForumBreadcrumbs,
		AppForumRules,
		FormForumTopic,
	},
})
export default class RouteForumsTopicsAdd extends Vue
{
	@State app: Store['app'];

	channel: ForumChannel = null as any;

	created()
	{
		Meta.title = this.$gettext( `Create a New Topic` );
	}

	@BeforeRouteEnter()
	routeEnter( this: undefined, route: VueRouter.Route )
	{
		return Api.sendRequest( '/web/forums/topics/create/' + route.params.channel );
	}

	routed()
	{
		this.channel = new ForumChannel( this.$payload.channel );
	}

	onCreated( formModel: ForumTopic )
	{
		// If their post was marked as spam, make sure they know.
		if ( formModel.status === ForumTopic.STATUS_SPAM ) {
			Growls.info(
				this.$gettext( `Your topic has been marked for review. Please allow some time for it to show on the site.` ),
				this.$gettext( `Topic Needs Review` ),
			);
		}

		this.$router.push( {
			name: 'forums.channels.view',
			params: { name: this.channel.name },
		} );
	}
}
