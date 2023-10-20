<script lang="ts">
import { computed, PropType, toRefs } from 'vue';
import { defineDynamicSlotProps, useDynamicSlots } from '../component-helpers';
import { Screen } from '../screen/screen-service';

const validSlots = ['leading', 'title', 'actions', 'bottom'] as const;
export type HeaderBarSlots = (typeof validSlots)[number];
</script>

<script lang="ts" setup>
const props = defineProps({
	...defineDynamicSlotProps(validSlots, true),
	centerTitle: {
		type: Boolean,
	},
	automaticallyImplyLeading: {
		type: Boolean,
		default: true,
	},
	elevation: {
		type: Number,
		default: 0,
	},
	titleSpacing: {
		type: Number,
		default: undefined,
		validator: val => (typeof val === 'number' && val >= 0) || typeof val === 'undefined',
	},
	titleSize: {
		type: String as PropType<'md' | 'lg'>,
		default: 'md',
	},
	edgePadding: {
		type: Number,
		default: undefined,
		validator: val => (typeof val === 'number' && val >= 0) || typeof val === 'undefined',
	},
	reverseLeading: {
		type: Boolean,
	},
	reverseActions: {
		type: Boolean,
	},
});

const {
	centerTitle,
	automaticallyImplyLeading,
	elevation,
	titleSpacing,
	edgePadding,
	dynamicSlots,
} = toRefs(props);

const { hasSlot } = useDynamicSlots(dynamicSlots);

const hasLeading = computed(() => hasSlot('leading'));
const hasTitle = computed(() => hasSlot('title'));
const hasActions = computed(() => hasSlot('actions'));
const hasBottom = computed(() => hasSlot('bottom'));

const shouldShrinkLeading = computed(() => !automaticallyImplyLeading.value && !hasLeading.value);
const shouldShrinkActions = computed(
	() => !hasActions.value || (shouldShrinkLeading.value && centerTitle.value)
);

const effectiveTitleSpacing = computed(() => {
	if (typeof titleSpacing?.value === 'number') {
		return titleSpacing.value;
	}
	return Screen.isXs ? 12 : 16;
});

const effectiveEdgePadding = computed(() => {
	if (typeof edgePadding?.value === 'number') {
		return edgePadding.value;
	}
	return Screen.isXs ? 12 : 16;
});
</script>

<template>
	<div class="header-bar" :class="`_elevate-${elevation}`">
		<div
			class="_inner-row"
			:class="{
				_center: centerTitle,
			}"
			:style="{
				padding: `0 ${effectiveEdgePadding}px`,
				gridGap: effectiveTitleSpacing + 'px',
			}"
		>
			<div
				v-if="hasLeading"
				class="_leading"
				:class="{
					_shrink: shouldShrinkLeading,
					'-reverse': reverseLeading,
				}"
			>
				<slot name="leading" />
			</div>

			<div
				v-if="hasTitle"
				class="_title"
				:class="[
					{
						_center: centerTitle,
					},
					`_size-${titleSize}`,
				]"
			>
				<slot name="title" />
			</div>

			<div
				v-if="hasActions"
				class="_actions"
				:class="{
					_shrink: shouldShrinkActions,
					_reverse: reverseActions,
				}"
			>
				<slot name="actions" />
			</div>
		</div>

		<slot v-if="hasBottom" name="bottom" />
	</div>
</template>

<style lang="stylus" scoped>
.header-bar
	width: 100%
	display: flex
	flex-direction: column
	flex-wrap: nowrap
	background-color: var(--theme-bg)

._inner-row
	display: flex
	flex-direction: row
	flex-wrap: nowrap
	min-height: 56px
	color: var(--theme-fg)
	padding: 0
	align-items: center
	justify-content: flex-start

	&._center
		justify-content: space-between

		._leading
		._actions
			flex: 1

		._leading
			margin-right: 0

		._title
			flex: none

		._actions
			margin-left: 0

._leading
._actions
	flex: none
	flex-basis: auto
	display: inline-flex

	&._reverse
		flex-direction: row-reverse

._leading
	justify-content: flex-start

._title
	font-weight: 800
	font-size: 19px
	font-family: $font-family-heading
	min-width: 0

._size-lg
	font-size: 24px
	line-height: 28px

._actions
	margin-left: auto
	justify-content: flex-end

._shrink
	flex-basis: 0

for i in 0..3
	._elevate-{i}
		elevate-{i}()
</style>
