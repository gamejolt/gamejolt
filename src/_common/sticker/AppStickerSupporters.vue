<script lang="ts" setup>
import { computed } from 'vue';

import { FiresidePostModel } from '~common/fireside/post/post-model';
import { showSupportersModal } from '~common/supporters/modal.service';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';
import AppUserAvatarImg from '~common/user/user-avatar/AppUserAvatarImg.vue';

type Props = {
	model: FiresidePostModel;
	supporters: UserModel[];
	limit?: number;
};
const { model, supporters, limit } = defineProps<Props>();

const displaySupporters = computed(() => supporters.slice(0, limit));

function onClick() {
	showSupportersModal({ model });
}
</script>

<template>
	<div
		v-app-tooltip="$gettext(`View supporters`)"
		class="sticker-supporters"
		:style="'--item-size: 20px; --item-offset: 12px; --height: 26px;'"
		@click.stop="onClick"
	>
		<div v-for="(user, index) of displaySupporters" :key="user.id" class="-item">
			<AppUserAvatarImg
				class="-item-img"
				:user="user"
				:style="{ zIndex: supporters.length - index }"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-supporters
	rounded-corners()
	change-bg(bg-offset)
	display: inline-flex
	height: var(--height)
	padding-right: unquote('calc(var(--item-size) - var(--item-offset) + 4px)')
	padding-left: 4px
	align-items: center
	cursor: pointer

.-item
	width: var(--item-offset)
	height: var(--item-size)
	position: relative

.-item-img
	change-bg(bg)
	img-circle()
	width: var(--item-size)
	height: var(--item-size)
	position: absolute
	top: 0
	left: 0
</style>
