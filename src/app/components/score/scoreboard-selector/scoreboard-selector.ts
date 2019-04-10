import { GameScoreTable } from 'game-jolt-frontend-lib/components/game/score-table/score-table.model';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
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
