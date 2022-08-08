<script lang="ts" setup>
defineProps({
	compact: {
		type: Boolean,
	},
	expandable: {
		type: Boolean,
	},
	expanded: {
		type: Boolean,
	},
	deletable: {
		type: Boolean,
	},
});

const emit = defineEmits({
	delete: () => true,
});
</script>

<template>
	<legend
		:class="{
			'-compact': compact,
			'-expandable': expandable,
			'-deletable': deletable,
		}"
	>
		<div class="-inner">
			<div v-if="expandable" class="-expander">{{ expanded ? `[-]` : `[+]` }}</div>
			<div class="-label"><slot /></div>
			<div v-if="compact" class="-compactbar" />
			<div v-if="deletable" class="-delete">
				<AppButton sparse circle icon="remove" @click="emit('delete')" />
			</div>
		</div>
	</legend>
</template>

<style lang="stylus" scoped>
.-compact
	position: relative
	font-size: $font-size-h4
	border: 0

.-expandable
	cursor: pointer
	user-select: none

.-inner
	display: flex
	align-items: center

.-expander
	flex: none
	// This makes it so that the expander takes up the same amount of space.
	font-family: monospace

.-label
	flex: none

.-compactbar
	theme-prop('border-bottom-color', 'bg-subtle')
	flex: auto
	height: 0
	border-bottom-width: $border-width-large
	border-bottom-style: solid
	margin-left: 20px

.-delete
	flex: none
	margin-left: 20px
</style>
