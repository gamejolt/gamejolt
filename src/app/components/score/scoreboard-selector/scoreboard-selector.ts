import { GameScoreTable } from '../../../../_common/game/score-table/score-table.model';
import AppPopper from '../../../../_common/popper/popper.vue';
import AppJolticon from '../../../../_common/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppPopper,
		AppJolticon,
	},
})
export default class AppScoreboardSelector extends Vue {
	@Prop(GameScoreTable) currentTable!: GameScoreTable;
	@Prop(Array) tables!: GameScoreTable[];

	selectTable(table: GameScoreTable) {
		this.$emit('select', table);
	}
}
