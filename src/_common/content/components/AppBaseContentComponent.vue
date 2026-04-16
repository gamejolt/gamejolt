<script lang="ts" setup>
import AppButton from '../../button/AppButton.vue';

type Props = {
	isEditing?: boolean;
	showEdit?: boolean;
	isDisabled?: boolean;
};
const { isDisabled } = defineProps<Props>();

const emit = defineEmits<{
	removed: [];
	edit: [];
}>();

function onRemovedClicked() {
	if (!isDisabled) {
		emit('removed');
	}
}

function onEditClicked() {
	if (!isDisabled) {
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
