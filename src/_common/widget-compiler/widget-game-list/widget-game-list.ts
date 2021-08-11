import { Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';
import { Game } from '../../game/game.model';
import AppGameThumbnailImg from '../../game/thumbnail-img/thumbnail-img.vue';
import { WidgetCompiler } from '../widget-compiler.service';

@Options({
	components: {
		AppGameThumbnailImg,
	},
})
export default class AppWidgetCompilerWidgetGameList extends Vue {
	@Prop({ type: Array, default: () => [] })
	games!: Game[];

	get contentClass() {
		return WidgetCompiler.getContentClass();
	}

	url(game: Game) {
		return game.site ? game.site.url : Environment.baseUrl + game.getUrl();
	}
}
