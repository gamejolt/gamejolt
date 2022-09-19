<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Game } from '../../../../_common/game/game.model';
import { Realm } from '../../../../_common/realm/realm-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { PostEditModal } from '../edit-modal/edit-modal-service';

const props = defineProps({
	game: {
		type: Object as PropType<Game>,
		default: undefined,
	},
	community: {
		type: Object as PropType<Community>,
		default: undefined,
	},
	channel: {
		type: Object as PropType<CommunityChannel>,
		default: undefined,
	},
	realm: {
		type: Object as PropType<Realm>,
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
	add: (_post: FiresidePost) => true,
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

	const postProvider = FiresidePost.$create(game?.value ? game.value.id : 0);

	const post = await PostEditModal.show(postProvider, {
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
			<AppUserAvatarImg :user="user" />
		</span>
		<div class="-input" @click="open()">
			{{ placeholderMessage }}
		</div>
	</div>
</template>

<style lang="stylus" src="./add-button.styl" scoped></style>