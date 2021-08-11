import { Options, Prop, Vue } from 'vue-property-decorator';
import { Game } from '../../../../_common/game/game.model';
import AppGameListItem from './item/item.vue';

@Options({
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
