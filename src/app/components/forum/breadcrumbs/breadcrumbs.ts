import { ForumChannel } from 'game-jolt-frontend-lib/components/forum/channel/channel.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
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
