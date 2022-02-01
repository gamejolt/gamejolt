<script lang="ts" setup>
import AppButton from '../../button/AppButton.vue';

const props = defineProps({
	isEditing: {
		type: Boolean,
	},
	showEdit: {
		type: Boolean,
	},
	isDisabled: {
		type: Boolean,
	},
});

const emit = defineEmits({
	removed: () => true,
	edit: () => true,
});

function onRemovedClicked() {
	if (!props.isDisabled) {
		emit('removed');
	}
}

function onEditClicked() {
	if (!props.isDisabled) {
		emit('edit');
	}
}
</script>

<template>
	<div class="base-content-component">
		<div v-if="isEditing" class="-controls theme-dark">
			<AppButton
				v-if="!GJ_IS_MOBILE_APP && showEdit"
				circle
				overlay
				icon="edit"
				:disabled="isDisabled"
				@click="onEditClicked"
			/>
			{{ ' ' }}
			<AppButton
				circle
				overlay
				icon="remove"
				:disabled="isDisabled"
				@click="onRemovedClicked"
			/>
		</div>

		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.base-content-component
	position: relative
	white-space: normal

	.-controls
		z-index: 10
		position: absolute
		top: 4px
		right: 4px
</style>
