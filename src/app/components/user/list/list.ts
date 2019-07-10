import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import AppUserListItem from './item/item.vue';

@Component({
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
