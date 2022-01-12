import { Options, Prop, Vue } from 'vue-property-decorator';
import { ForumChannel } from '../../../../_common/forum/channel/channel.model';

@Options({})
export default class AppForumBreadcrumbs extends Vue {
	@Prop(Object) channel?: ForumChannel;
	@Prop(String) sort?: string;
	@Prop(String) page?: string;
}
