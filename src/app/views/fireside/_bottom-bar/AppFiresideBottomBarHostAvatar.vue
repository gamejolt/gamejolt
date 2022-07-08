<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { FiresideRTCProducer } from '../../../../_common/fireside/rtc/producer';
import { FiresideRTCUser } from '../../../../_common/fireside/rtc/user';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';

const props = defineProps({
	host: {
		type: Object as PropType<FiresideRTCUser | FiresideRTCProducer>,
		required: true,
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
	return `calc( max( ${clamped}px, ${clamped}% ))`;
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

const isActive = computed(() => {
	if (!rtc.value || !rtc.value.focusedUser) {
		return false;
	}

	return rtc.value.focusedUser.uid === uid.value;
});
</script>

<template>
	<div class="-indicator-wrap" :class="{ '-active-hover': isActive }" :style="{ padding }">
		<div class="-indicator-color" />
		<div class="-indicator">
			<template v-if="userModel">
				<AppUserAvatarImg class="-img -help" :user="userModel" />
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-indicator-color
	z-index: 0

.-indicator
	z-index: 1

.-indicator
.-indicator-wrap
.-indicator-color
	img-circle()

.-active-hover
	elevate-2() !important

.-indicator-wrap
	elevate-1()
	position: relative
	height: 100%
	width: 100%
	overflow: hidden
	display: flex
	align-items: center
	justify-content: center
	border-radius: 50%
	transition: padding 100ms cubic-bezier(0.39, 0.58, 0.57, 1)
	will-change: padding

.-indicator-color
	background-color: var(--theme-link)
	position: absolute
	// Inset this slightly so the color doesn't show behind the antialiasing
	top: 1px
	right: @top
	bottom: @top
	left: @top

.-indicator
	background-color: var(--theme-bg-offset)
	color: var(--theme-fg)
	display: flex
	justify-content: center
	align-items: center
	height: 100%
	width: 100%

.-img
	&
	::v-deep(img)
		height: 100%
		width: 100%
</style>
