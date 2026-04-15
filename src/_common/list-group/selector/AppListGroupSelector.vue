<script lang="ts" setup generic="T extends TrophyNavGame | GameScoreTableModel">
import { PropType } from 'vue';

import { TrophyNavGame } from '../../../app/views/profile/trophies/_nav/AppProfileTrophiesNav.vue';
import { GameScoreTableModel } from '../../game/score-table/score-table.model';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppPopper from '../../popper/AppPopper.vue';

defineProps({
	current: {
		type: Object as PropType<T | undefined>,
		default: undefined,
	},
	items: {
		type: Array as PropType<T[]>,
		default: () => [],
	},
});

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
							<AppJolticon
								v-if="current && (current as any).id === (item as any).id"
								icon="check"
							/>
						</div>

						<slot :item="item" />
					</a>
				</div>
			</template>
		</AppPopper>
	</div>
</template>
