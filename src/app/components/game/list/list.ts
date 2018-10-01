import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./list.html';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppGameListItem } from './item/item';

@View
@Component({
	components: {
		AppGameListItem,
	},
})
export class AppGameList extends Vue {
	@Prop(Array) games!: Game[];
	@Prop(String) eventLabel?: string;
}
