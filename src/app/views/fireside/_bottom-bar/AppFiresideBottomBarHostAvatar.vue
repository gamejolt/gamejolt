<script lang="ts" setup>
import { shade } from 'polished';
import { computed, PropType, toRefs } from 'vue';
import { FiresideRTCProducer } from '../../../../_common/fireside/rtc/producer';
import { FiresideRTCUser } from '../../../../_common/fireside/rtc/user';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';

const BandGap = 2;
const BandWidth = 3;

const props = defineProps({
	host: {
		type: Object as PropType<FiresideRTCUser | FiresideRTCProducer>,
		required: true,
	},
	fillParent: {
		type: Boolean,
	},
	fillRadius: {
		type: String as PropType<'sm' | 'md' | 'lg'>,
		default: undefined,
	},
});

const { host } = toRefs(props);
const { user } = useCommonStore();
const { rtc } = useFiresideController()!;

const padding = computed(() => {
	if (!(host.value instanceof FiresideRTCUser)) {
		return '';
	}

	// Make a nice looking curve, have it snap to a small number of positions.
	const volumeAdjusted =
		Math.pow(Math.log10(host.value.volumeLevel * 100 + 1), 1.5) /
		Math.pow(Math.log10(101), 1.5);

	const accuracy = 7;
	const volumeSnapped = Math.round(volumeAdjusted * accuracy) / accuracy;
	// Doing either ceil or floor here will help with weird half-value
	// padding jank depending on the browser.
	const clamped = Math.ceil(Math.min(1, Math.max(0, volumeSnapped)) * 6);
	return `calc( min(${BandGap + BandWidth}px, max( ${clamped}px, ${clamped}% )))`;
});

const uid = computed(() => {
	if (host.value instanceof FiresideRTCUser) {
		return host.value.uid;
	} else {
		return undefined;
	}
});

const userModel = computed(() => {
	if (host.value instanceof FiresideRTCUser) {
		return host.value.userModel;
	} else {
		return user.value;
	}
});

const imgColorTint = computed(() => {
	const color = userModel.value?.avatar_media_item?.avg_img_color;
	if (!color) {
		return undefined;
	}

	try {
		return shade(-0.15, `#${color}`);
	} catch {
		return undefined;
	}
});

const isActive = computed(() => {
	if (!rtc.value || !rtc.value.focusedUser) {
		return false;
	}

	return rtc.value.focusedUser.uid === uid.value;
});
</script>

<template>
	<div
		class="bottom-bar-host-avatar"
		:class="{
			'-active-hover': isActive,
			'-fill-parent': fillParent,
			'-sm': fillRadius === 'sm',
			'-md': fillRadius === 'md',
			'-lg': fillRadius === 'lg',
		}"
		:style="[`padding: ${padding}`, `--band-width: ${BandWidth}px`]"
	>
		<div class="-highlight-band" />

		<div
			class="-indicator"
			:style="{
				backgroundImage: imgColorTint
					? `linear-gradient(${imgColorTint}, ${imgColorTint})`
					: undefined,
			}"
		>
			<div v-if="userModel" class="-avatar">
				<AppUserAvatarImg class="-img -help" :user="userModel" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-indicator
	z-index: 1

.-highlight-band
	z-index: -1

.bottom-bar-host-avatar
	elevate-1()
	position: relative
	height: 100%
	width: 100%
	overflow: hidden
	display: flex
	align-items: center
	justify-content: center
	transition: all 300ms cubic-bezier(0.39, 0.58, 0.57, 1) !important
	will-change: padding

	&
	.-indicator
	.-highlight-band
		border-radius: 50%
		transition: border-radius 300ms $strong-ease-out

.-fill-parent
	.-avatar
		width: calc(var(--fireside-host-size) - 32px)
		height: @width

	&.-inherit
		&
		.-indicator-color
		.-indicator
		.-highlight-band
			border-radius: inherit

	&.-sm
		--radius: $border-radius-sm
	&.-md
		--radius: $border-radius-base
	&.-lg
		--radius: $border-radius-large

	&.-sm
	&.-md
	&.-lg
		border-radius: var(--radius)

		.-highlight-band
			border-radius: calc(var(--radius) * 1.01)

		.-indicator
			border-radius: calc(var(--radius) * 0.5)

.-active-hover
	elevate-2() !important

.-indicator
	background-color: var(--theme-bg-offset)
	color: var(--theme-fg)
	display: flex
	justify-content: center
	align-items: center
	height: 100%
	width: 100%
	position: relative

.-highlight-band
	border: var(--band-width) solid var(--theme-primary)
	position: absolute
	top: 0
	right: @top
	bottom: @top
	left: @top

.-img
.-avatar
	&
	::v-deep(img)
		height: 100%
		width: 100%
</style>
