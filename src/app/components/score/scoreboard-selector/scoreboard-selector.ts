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
