<script lang="ts" setup>
import { GameScoreTableModel } from '../../../../_common/game/score-table/score-table.model';
import AppListGroupSelector from '../../../../_common/list-group/selector/AppListGroupSelector.vue';

type Props = {
	currentTable: GameScoreTableModel;
	tables: GameScoreTableModel[];
};

const { currentTable, tables } = defineProps<Props>();

const emit = defineEmits<{
	select: [table: GameScoreTableModel];
}>();
</script>

<template>
	<AppListGroupSelector :items="tables" :current="currentTable" @change="emit('select', $event)">
		<template #default="{ item }">
			<h5 class="list-group-item-heading sans-margin-bottom">
				<strong>{{ item.name }}</strong>
			</h5>
			<p class="list-group-item-text">
				{{ item.description }}
			</p>
		</template>
	</AppListGroupSelector>
</template>
