<script lang="ts" setup>
import { computed } from 'vue';

import { showPostEditModal } from '~app/components/post/edit-modal/edit-modal-service';
import { vAppAuthRequired } from '~common/auth/auth-required-directive';
import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { CommunityModel } from '~common/community/community.model';
import { $createFiresidePost, FiresidePostModel } from '~common/fireside/post/post-model';
import { GameModel } from '~common/game/game.model';
import { RealmModel } from '~common/realm/realm-model';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';

type Props = {
	game?: GameModel;
	community?: CommunityModel;
	channel?: CommunityChannelModel;
	realm?: RealmModel;
	placeholder?: string;
	previewOnly?: boolean;
};
const { game, community, channel, realm, placeholder = '', previewOnly } = defineProps<Props>();

const emit = defineEmits<{
	add: [post: FiresidePostModel];
}>();

const { user } = useCommonStore();

const placeholderMessage = computed(() => placeholder || $gettext(`So, what's on your mind?`));

async function open() {
	if (previewOnly) {
		return;
	}

	const postProvider = $createFiresidePost(game ? game.id : 0);

	const post = await showPostEditModal(postProvider, {
		community,
		channel,
		realm,
	});

	if (!post) {
		return;
	}

	emit('add', post);
}
</script>

<template>
	<div v-app-auth-required class="post-add-button sheet sheet-elevate">
		<span class="-avatar">
			<AppUserCardHover :user="user">
				<AppUserAvatarBubble :user="user" show-frame show-verified />
			</AppUserCardHover>
		</span>
		<div class="-input-container">
			<div v-if="user" class="-username">Hey @{{ user.username }}</div>
			<div class="-input" @click="open()">
				{{ placeholderMessage }}
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="~app/components/post/add-button/add-button.styl" scoped></style>
