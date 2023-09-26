<script lang="ts">
import { CSSProperties, computed, toRefs } from 'vue';
import {
	defineDynamicSlotProps,
	useDynamicSlots,
} from '../../../../../../_common/component-helpers';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { kThemeBgOffset } from '../../../../../../_common/theme/variables';
import {
	styleBorderRadiusLg,
	styleElevate,
	styleTextOverflow,
	styleWhen,
} from '../../../../../../_styles/mixins';

const SlotProps = ['before', 'after'] as const;
</script>

<script lang="ts" setup>
const props = defineProps({
	...defineDynamicSlotProps(SlotProps, true),
});

const { dynamicSlots } = toRefs(props);
const { hasSlot } = useDynamicSlots(dynamicSlots);

const canFitArrow = computed(() => Screen.isDesktop);
const shouldShowArrow = computed(() => canFitArrow.value && hasSlot('before') && hasSlot('after'));

const baseStyles = computed<CSSProperties>(() => {
	const columns = ['minmax(0, 1fr)', 'minmax(0, 1fr)'];
	const areas = ['a', 'b'];

	const middleCol = canFitArrow.value ? ' 36px ' : ' ';
	const middleArea = canFitArrow.value ? ' arrow ' : ' ';

	// Moves the "New product" card to the left if we won't be showing the
	// "before" diff.
	if (!hasSlot('before')) {
		areas.reverse();
	}

	return {
		display: `grid`,
		gridTemplateColumns: columns.join(middleCol),
		gridTemplateAreas: `"${areas.join(middleArea)}"`,
		gap: `16px`,
		alignItems: `center`,
		marginBottom: `16px`,
	};
});

const headerStyles: CSSProperties = {
	...styleTextOverflow,
	marginTop: 0,
	marginBottom: `4px`,
	minWidth: 0,
};

const sectionStyles: CSSProperties = {
	height: `100%`,
	display: `flex`,
	flexDirection: `column`,
};

const imgCardStyles = computed<CSSProperties>(() => {
	return {
		...styleBorderRadiusLg,
		...styleElevate(1),
		flex: `auto`,
		backgroundColor: kThemeBgOffset,
		padding: `24px`,
		display: `flex`,
		flexDirection: `column`,
		...styleWhen(Screen.isXs, {
			padding: `12px`,
		}),
	};
});

const jolticonStyles: CSSProperties = {
	margin: 0,
	fontSize: `24px`,
	justifySelf: `center`,
	alignSelf: `center`,
};

const transitionContainerStyles: CSSProperties = {
	position: `relative`,
	width: `100%`,
	height: `100%`,
};
</script>

<template>
	<div :style="baseStyles">
		<div :style="[transitionContainerStyles, { gridArea: `a` }]">
			<Transition name="fade">
				<div v-if="hasSlot('before')" :style="sectionStyles">
					<h6 :style="headerStyles">
						{{ $gettext(`Current product`) }}
					</h6>
					<div :style="imgCardStyles">
						<slot name="before" />
					</div>
				</div>
			</Transition>
		</div>

		<div
			v-if="canFitArrow"
			:style="[transitionContainerStyles, { height: `36px`, gridArea: `arrow` }]"
		>
			<Transition name="fade">
				<AppJolticon v-if="shouldShowArrow" icon="arrow-right" :style="jolticonStyles" />
				<div v-else />
			</Transition>
		</div>

		<div :style="[transitionContainerStyles, { gridArea: `b` }]">
			<Transition name="fade">
				<div v-if="hasSlot('after')" :style="sectionStyles">
					<h6 :style="headerStyles">
						{{ hasSlot('before') ? $gettext(`New changes`) : $gettext(`New product`) }}
					</h6>
					<div :style="imgCardStyles">
						<slot name="after" />
					</div>
				</div>
			</Transition>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
// Delay is added here so diffs don't fade in/out when there's an immediate form
// error with the image file selected.
.fade-enter-active
.fade-leave-active
	transition: opacity 200ms $strong-ease-out
	transition-delay: 100ms

.fade-enter-from
.fade-leave-to
	opacity: 0
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
</style>
