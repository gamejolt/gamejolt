import { Game } from '../../../../_common/game/game.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppGameListItem from './item/item.vue';

@Component({
	components: {
		AppGameListItem,
	},
})
export default class AppGameList extends Vue {
	@Prop(Array)
	games!: Game[];

	@Prop(String)
	eventLabel?: string;
}
