import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Game } from '../../game/game.model';
import AppGameThumbnailImg from '../../game/thumbnail-img/thumbnail-img.vue';
import { Environment } from '../../environment/environment.service';
import { WidgetCompiler } from '../widget-compiler.service';

@Component({
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
