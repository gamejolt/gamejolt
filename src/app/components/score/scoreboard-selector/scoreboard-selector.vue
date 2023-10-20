<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { GameScoreTableModel } from '../../../../_common/game/score-table/score-table.model';
import AppListGroupSelector from '../../../../_common/list-group/selector/AppListGroupSelector.vue';

@Options({
	components: {
		AppListGroupSelector,
	},
})
export default class AppScoreboardSelector extends Vue {
	@Prop(Object) currentTable!: GameScoreTableModel;
	@Prop(Array) tables!: GameScoreTableModel[];

	@Emit('select')
	emitSelect(_table: GameScoreTableModel) {}
}
</script>

<template>
	<AppListGroupSelector :items="tables" :current="currentTable" @change="emitSelect($event)">
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
