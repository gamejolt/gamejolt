<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import { useCardList } from '~common/card/list/AppCardList.vue';
import AppExpand from '~common/expand/AppExpand.vue';
import { Jolticon } from '~common/jolticon/AppJolticon.vue';
import { getScreen } from '~common/screen/screen-service';

type Props = {
	label: string;
	icon?: Jolticon;
};
const { icon } = defineProps<Props>();

const emit = defineEmits<{
	toggle: [];
}>();

const { isAdding } = useCardList()!;
</script>

<template>
	<div class="card-list-item card-list-add" :class="{ active: isAdding }">
		<AppButton primary block :solid="isAdding" :icon="icon" @click="emit('toggle')">
			{{ label }}
		</AppButton>

		<div class="card-list-item-body full-bleed-xs">
			<AppExpand :when="isAdding">
				<div class="well fill-offset" :class="{ 'well-row': getScreen().isXs.value }">
					<slot />
				</div>
			</AppExpand>
		</div>
	</div>
</template>

<style lang="stylus" src="~common/card/list/list-common.styl" scoped></style>
