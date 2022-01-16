<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { GameScoreTable } from '../../../../_common/game/score-table/score-table.model';
import AppListGroupSelector from '../../../../_common/list-group/selector/selector.vue';

@Options({
	components: {
		AppListGroupSelector,
	},
})
export default class AppScoreboardSelector extends Vue {
	@Prop(Object) currentTable!: GameScoreTable;
	@Prop(Array) tables!: GameScoreTable[];

	@Emit('select')
	emitSelect(_table: GameScoreTable) {}
}
</script>

<template>
	<app-list-group-selector :items="tables" :current="currentTable" @change="emitSelect($event)">
		<template #default="{ item }">
			<h5 class="list-group-item-heading sans-margin-bottom">
				<strong>{{ item.name }}</strong>
			</h5>
			<p class="list-group-item-text">
				{{ item.description }}
			</p>
		</template>
	</app-list-group-selector>
</template>
