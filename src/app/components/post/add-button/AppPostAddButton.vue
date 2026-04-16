<script lang="ts" setup>
import { computed } from 'vue';

import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { CommunityChannelModel } from '../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../_common/community/community.model';
import {
	$createFiresidePost,
	FiresidePostModel,
} from '../../../../_common/fireside/post/post-model';
import { GameModel } from '../../../../_common/game/game.model';
import { RealmModel } from '../../../../_common/realm/realm-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { showPostEditModal } from '../edit-modal/edit-modal-service';

type Props = {
	game?: GameModel;
	community?: CommunityModel;
	channel?: CommunityChannelModel;
	realm?: RealmModel;
	placeholder?: string;
	previewOnly?: boolean;
};
const {
	game,
	community,
	channel,
	realm,
	placeholder = '',
	previewOnly,
} = defineProps<Props>();

const emit = defineEmits<{
	add: [post: FiresidePostModel];
}>();

const { user } = useCommonStore();

const placeholderMessage = computed(
	() => placeholder || $gettext(`So, what's on your mind?`)
);

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

<style lang="stylus" src="./add-button.styl" scoped></style>
