import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./scoreboard-selector.html';

import { GameScoreTable } from '../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';

@View
@Component({
	components: {
		AppPopover,
		AppJolticon,
	},
	directives: {
		AppPopoverTrigger,
	},
})
export class AppScoreboardSelector extends Vue {
	@Prop([GameScoreTable])
	currentTable: GameScoreTable;
	@Prop([Array])
	tables: GameScoreTable[];

	selectTable(table: GameScoreTable) {
		this.$emit('select', table);
	}
}
