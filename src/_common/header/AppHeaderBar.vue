<script lang="ts">
import { computed, PropType, toRefs, useSlots } from 'vue';
import { Screen } from '../screen/screen-service';

export type HeaderBarSlots = 'leading' | 'title' | 'actions' | 'bottom';
</script>

<script lang="ts" setup>
const props = defineProps({
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
	/**
	 * Used to specifically define the slots that should be built. Can be used
	 * to "remove" slots and prevent flex/grid gaps from being built around
	 * empty items.
	 */
	definedSlots: {
		type: Array as PropType<HeaderBarSlots[]>,
		default: undefined,
	},
});

const slots = useSlots();

const {
	centerTitle,
	automaticallyImplyLeading,
	elevation,
	titleSpacing,
	edgePadding,
	definedSlots,
} = toRefs(props);

const hasLeading = computed(() =>
	definedSlots?.value ? definedSlots.value.includes('leading') : !!slots['leading']
);
const hasActions = computed(() =>
	definedSlots?.value ? definedSlots.value.includes('actions') : !!slots['actions']
);
const hasBottom = computed(() =>
	definedSlots?.value ? definedSlots.value.includes('bottom') : !!slots['bottom']
);

const noLeading = computed(() => definedSlots?.value && !definedSlots.value.includes('leading'));
const noTitle = computed(() => definedSlots?.value && !definedSlots.value.includes('title'));
const noActions = computed(() => definedSlots?.value && !definedSlots.value.includes('actions'));

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

	return Screen.isXs ? 0 : 16;
});
</script>

<template>
	<div class="header-bar" :class="`-elevate-${elevation}`">
		<div
			class="-inner-row"
			:class="{
				'-center': centerTitle,
			}"
			:style="{
				padding: `0 ${effectiveEdgePadding}px`,
				gridGap: effectiveTitleSpacing + 'px',
			}"
		>
			<div
				v-if="!noLeading"
				class="-leading"
				:class="{
					'-shrink': shouldShrinkLeading,
				}"
			>
				<slot name="leading" />
			</div>

			<div
				v-if="!noTitle"
				class="-title"
				:class="[
					{
						'-center': centerTitle,
					},
					`-size-${titleSize}`,
				]"
			>
				<slot name="title" />
			</div>

			<div
				v-if="!noActions"
				class="-actions"
				:class="{
					'-shrink': shouldShrinkActions,
				}"
			>
				<slot name="actions" />
			</div>
		</div>

		<div v-if="hasBottom" class="-bottom">
			<slot name="bottom" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.header-bar
	width: 100%
	display: flex
	flex-direction: column
	flex-wrap: nowrap
	background-color: var(--theme-bg)

.-inner-row
	display: flex
	flex-direction: row
	flex-wrap: nowrap
	min-height: 56px
	color: var(--theme-fg)
	padding: 0
	align-items: center
	justify-content: flex-start

	&.-center
		justify-content: space-between

		.-leading
		.-actions
			flex: 1

		.-leading
			margin-right: 0

		.-title
			flex: none

		.-actions
			margin-left: 0

.-leading
.-actions
	flex: none
	flex-basis: auto
	display: inline-flex

.-leading
	justify-content: flex-start

.-title
	font-weight: 800
	font-size: 19px
	font-family: $font-family-heading
	min-width: 0

.-size-lg
	font-size: 24px
	line-height: 28px

.-actions
	margin-left: auto
	justify-content: flex-end

.-shrink
	flex-basis: 0

for i in 0..3
	.-elevate-{i}
		elevate-{i}()
</style>
