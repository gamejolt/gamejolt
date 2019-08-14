import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { GameScoreTable } from '../../../../_common/game/score-table/score-table.model';
import AppPopper from '../../../../_common/popper/popper.vue';

@Component({
	components: {
		AppPopper,
	},
})
export default class AppScoreboardSelector extends Vue {
	@Prop(GameScoreTable) currentTable!: GameScoreTable;
	@Prop(Array) tables!: GameScoreTable[];

	selectTable(table: GameScoreTable) {
		this.$emit('select', table);
	}
}
