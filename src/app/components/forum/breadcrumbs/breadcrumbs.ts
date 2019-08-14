import { ForumChannel } from '../../../../_common/forum/channel/channel.model';
import AppJolticon from '../../../../_common/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppJolticon,
	},
})
export default class AppForumBreadcrumbs extends Vue {
	@Prop(ForumChannel) channel?: ForumChannel;
	@Prop(String) sort?: string;
	@Prop(String) page?: string;
}
