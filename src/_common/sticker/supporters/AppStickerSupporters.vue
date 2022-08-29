<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';
import AppUserAvatarImg from '../../user/user-avatar/img/img.vue';
import { User } from '../../user/user.model';
import { StickerSupportersModal } from './modal.service';

const props = defineProps({
	supporters: {
		type: Array as PropType<User[]>,
		required: true,
	},
	limit: {
		type: Number,
		default: undefined,
	},
});

const { supporters, limit } = toRefs(props);

const displaySupporters = computed(() => supporters.value.slice(0, limit?.value));

function onClick() {
	StickerSupportersModal.show(supporters.value);
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
			<AppUserAvatarImg class="-item-img" :style="{ zIndex: supporters.length - index }" />
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
