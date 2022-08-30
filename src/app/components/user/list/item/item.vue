<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppUserCardHover from '../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import { User } from '../../../../../_common/user/user.model';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';

@Options({
	components: {
		AppUserAvatarImg,
		AppUserFollowWidget,
		AppUserVerifiedTick,
		AppUserCardHover,
	},
})
export default class AppUserListItem extends Vue {
	@Prop(Object)
	user!: User;

	@Prop({ type: String, required: false, default: 'global' })
	eventLabel!: string;

	@Prop(Boolean)
	userHoverCard?: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	readonly Screen = Screen;

	@Emit('follow')
	emitFollow() {}

	@Emit('unfollow')
	emitUnfollow() {}
}
</script>

<template>
	<router-link
		v-app-track-event="`user-list:click:${eventLabel}`"
		class="user-list-item"
		:to="{
			name: 'profile.overview',
			params: {
				username: user.username,
			},
		}"
	>
		<component :is="userHoverCard ? 'app-user-card-hover' : 'div'" :user="user" class="-avatar">
			<AppUserAvatarImg :user="user" />
		</component>

		<div class="-label">
			<div class="-name">
				{{ user.display_name }}
				<AppUserVerifiedTick :user="user" />
			</div>
			<div class="-username">@{{ user.username }}</div>
		</div>

		<div v-if="app.user && user.id !== app.user.id" class="-button">
			<!--
				Gotta prevent default so that the router-link doesn't go to the
				user page. The stop is so that we don't double track events.
			-->
			<AppUserFollowWidget
				:user="user"
				hide-count
				location="userList"
				@click.capture.prevent
				@click.stop
				@follow="emitFollow()"
				@unfollow="emitUnfollow()"
			/>
		</div>
	</router-link>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
