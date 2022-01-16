<script lang="ts">
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
</script>

<template>
	<div class="user-list">
		<app-user-list-item
			v-for="user of users"
			:key="user.id"
			:user="user"
			:event-label="eventLabel"
			:user-hover-card="userHoverCard"
			@follow="emitFollow(user)"
			@unfollow="emitUnfollow(user)"
		/>
	</div>
</template>
