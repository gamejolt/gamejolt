<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
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

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		default: undefined,
	},
	community: {
		type: Object as PropType<CommunityModel>,
		default: undefined,
	},
	channel: {
		type: Object as PropType<CommunityChannelModel>,
		default: undefined,
	},
	realm: {
		type: Object as PropType<RealmModel>,
		default: undefined,
	},
	placeholder: {
		type: String,
		default: '',
	},
	previewOnly: {
		type: Boolean,
	},
});

const emit = defineEmits({
	add: (_post: FiresidePostModel) => true,
});

const { placeholder, previewOnly, game, community, channel, realm } = toRefs(props);
const { user } = useCommonStore();

const placeholderMessage = computed(
	() => placeholder.value || $gettext(`So, what's on your mind?`)
);

async function open() {
	if (previewOnly.value) {
		return;
	}

	const postProvider = $createFiresidePost(game?.value ? game.value.id : 0);

	const post = await showPostEditModal(postProvider, {
		community: community?.value,
		channel: channel?.value,
		realm: realm?.value,
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
