<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Game } from '../../../../_common/game/game.model';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { PostEditModal } from '../edit-modal/edit-modal-service';

@Options({
	components: {
		AppUserAvatarImg,
	},
	directives: {
		AppAuthRequired: vAppAuthRequired,
	},
})
export default class AppPostAddButton extends Vue {
	@Prop(Object)
	game?: Game;

	@Prop(Object)
	community?: Community;

	@Prop(Object)
	channel?: CommunityChannel;

	@Prop(String)
	placeholder?: string;

	@Prop(Boolean)
	previewOnly?: boolean;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	readonly Screen = Screen;

	@Emit()
	add(_post: FiresidePost) {}

	get placeholderMessage() {
		return this.placeholder || this.$gettext(`So, what's on your mind?`);
	}

	async open() {
		if (this.previewOnly) {
			return;
		}

		const postProvider = FiresidePost.$create(this.game ? this.game.id : 0);

		const post = await PostEditModal.show(postProvider, {
			community: this.community,
			channel: this.channel,
		});

		if (!post) {
			return;
		}

		this.add(post);
	}
}
</script>

<template>
	<div v-app-auth-required class="post-add-button sheet sheet-elevate">
		<span class="-avatar">
			<AppUserAvatarImg :user="user" />
		</span>
		<div class="-input" @click="open()">
			{{ placeholderMessage }}
		</div>
	</div>
</template>

<style lang="stylus" src="./add-button.styl" scoped></style>
