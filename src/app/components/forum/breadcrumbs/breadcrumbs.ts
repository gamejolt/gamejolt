import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ForumChannel } from '../../../../_common/forum/channel/channel.model';

@Component({})
export default class AppForumBreadcrumbs extends Vue {
	@Prop(ForumChannel) channel?: ForumChannel;
	@Prop(String) sort?: string;
	@Prop(String) page?: string;
}
