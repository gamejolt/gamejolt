import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { User } from '../../../../_common/user/user.model';
import AppUserListItem from './item/item.vue';

@Options({
	components: {
		AppUserListItem,
	},
})
export default class AppUserList extends Vue {
	@Prop(Array)
	users!: User[];

	@Prop(String)
	eventLabel?: string;

	@Prop(Boolean)
	userHoverCard?: boolean;

	@Emit('follow')
	emitFollow(_user: User) {}

	@Emit('unfollow')
	emitUnfollow(_user: User) {}
}
