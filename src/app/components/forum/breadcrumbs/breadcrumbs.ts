import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./breadcrumbs.html';

import { ForumChannel } from '../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppForumBreadcrumbs extends Vue {
	@Prop(ForumChannel) channel?: ForumChannel;
	@Prop(String) sort?: string;
	@Prop(String) page?: string;
}
