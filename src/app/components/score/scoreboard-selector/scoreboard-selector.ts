import { Options, Prop, Vue } from 'vue-property-decorator';
import { GameScoreTable } from '../../../../_common/game/score-table/score-table.model';
import AppListGroupSelector from '../../../../_common/list-group/selector/selector.vue';

@Options({
	components: {
		AppListGroupSelector,
	},
})
export default class AppScoreboardSelector extends Vue {
	@Prop(GameScoreTable) currentTable!: GameScoreTable;
	@Prop(Array) tables!: GameScoreTable[];

	selectTable(table: GameScoreTable) {
		this.$emit('select', table);
	}
}
