<script lang="ts" setup generic="T extends { id: string | number }">
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppPopper from '~common/popper/AppPopper.vue';

type Props = {
	current?: T;
	items?: T[];
};
const { current, items = [] } = defineProps<Props>();

const emit = defineEmits<{
	change: [item: any];
}>();

function select(item: any) {
	emit('change', item);
}
</script>

<template>
	<div class="list-group">
		<AppPopper popover-class="fill-bg" block track-trigger-width hide-on-state-change>
			<a class="list-group-item has-addon">
				<div class="list-group-item-addon">
					<AppJolticon icon="chevron-down" />
				</div>

				<slot :item="current" />
			</a>

			<template #popover>
				<div class="list-group">
					<a
						v-for="item of items"
						:key="item.id"
						class="list-group-item has-addon"
						@click="select(item)"
					>
						<div class="list-group-item-addon">
							<AppJolticon v-if="current && current.id === item.id" icon="check" />
						</div>

						<slot :item="item" />
					</a>
				</div>
			</template>
		</AppPopper>
	</div>
</template>
