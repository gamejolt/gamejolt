import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./scoreboard-selector.html';

import { GameScoreTable } from '../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopper } from '../../../../lib/gj-lib-client/components/popper/popper';

@View
@Component({
	components: {
		AppPopper,
		AppJolticon,
	},
})
export class AppScoreboardSelector extends Vue {
	@Prop(GameScoreTable) currentTable: GameScoreTable;
	@Prop(Array) tables: GameScoreTable[];

	selectTable(table: GameScoreTable) {
		this.$emit('select', table);
	}
}
