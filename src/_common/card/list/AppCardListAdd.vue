<script lang="ts" setup>
import AppButton from '../../button/AppButton.vue';
import AppExpand from '../../expand/AppExpand.vue';
import { Screen } from '../../screen/screen-service';
import { useCardList } from './AppCardList.vue';

defineProps({
	label: {
		type: String,
		required: true,
	},
	icon: {
		type: String,
		default: '',
	},
});

const emit = defineEmits({
	toggle: () => true,
});

const { isAdding } = useCardList()!;
</script>

<template>
	<div class="card-list-item card-list-add" :class="{ active: isAdding }">
		<AppButton primary block :solid="isAdding" :icon="icon" @click="emit('toggle')">
			{{ label }}
		</AppButton>

		<div class="card-list-item-body full-bleed-xs">
			<AppExpand :when="isAdding">
				<div class="well fill-offset" :class="{ 'well-row': Screen.isXs }">
					<slot />
				</div>
			</AppExpand>
		</div>
	</div>
</template>

<style lang="stylus" src="./list-common.styl" scoped></style>
