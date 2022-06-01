<script lang="ts">
import { computed, toRefs, useSlots } from 'vue';
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
		default: 8,
		validator: val => typeof val === 'number' && val >= 0,
	},
	edgePadding: {
		type: Number,
		default: 8,
		validator: val => typeof val === 'number' && val >= 0,
	},
});

const slots = useSlots();

const { centerTitle, automaticallyImplyLeading, elevation, titleSpacing } = toRefs(props);

const hasLeading = computed(() => !!slots['leading']);
const hasActions = computed(() => !!slots['actions']);
const hasBottom = computed(() => !!slots['bottom']);

const shouldShrinkLeading = computed(() => !automaticallyImplyLeading.value && !hasLeading.value);
const shouldShrinkActions = computed(
	() => !hasActions.value || (shouldShrinkLeading.value && centerTitle.value)
);
</script>

<template>
	<div class="mobile-app-bar" :class="`-elevate-${elevation}`">
		<div
			class="-inner-row"
			:class="{
				'-center': centerTitle,
			}"
			:style="{
				padding: `0 ${edgePadding}px`,
				gridGap: titleSpacing + 'px',
			}"
		>
			<div
				class="-leading"
				:class="{
					'-shrink': shouldShrinkLeading,
				}"
			>
				<slot name="leading" />
			</div>

			<div
				class="-title"
				:class="{
					'-center': centerTitle,
				}"
			>
				<slot name="title" />
			</div>

			<div
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
.mobile-app-bar
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

.-actions
	margin-left: auto

.-title
	font-size: 20px
	font-family: $font-family-heading
	font-weight: 800

.-shrink
	flex-basis: 0

for i in 0..3
	.-elevate-{i}
		elevate-{i}()
</style>
