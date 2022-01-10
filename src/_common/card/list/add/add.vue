<script lang="ts" setup>
import AppExpand from '../../../expand/expand.vue';
import { Screen } from '../../../screen/screen-service';
import { useCardList } from '../list.vue';

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

const toggle = () => emit('toggle');
</script>

<template>
	<div class="card-list-item card-list-add" :class="{ active: isAdding }">
		<AppButton primary block :solid="isAdding" :icon="icon" @click="toggle">
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

<style lang="stylus" src="../list-common.styl" scoped></style>
