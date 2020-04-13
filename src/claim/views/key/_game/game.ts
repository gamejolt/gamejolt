import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { propOptional, propRequired } from '../../../../utils/vue';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { CustomMessage as CustomGameMessage, Game } from '../../../../_common/game/game.model';
import AppGamePackageCard from '../../../../_common/game/package/card/card.vue';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import { KeyGroup } from '../../../../_common/key-group/key-group.model';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import { ThemeMutation, ThemeStore } from '../../../../_common/theme/theme.store';
import { Store } from '../../../store/index';

@Component({
	components: {
		AppFadeCollapse,
		AppGamePackageCard,
		AppMediaItemCover,
		AppContentViewer,
	},
})
export default class AppKeyGame extends Vue {
	@Prop({ required: true })
	payload!: any;

	@Prop(propRequired(String))
	loginUrl!: string;

	@Prop(propOptional(String))
	accessKey?: string;

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	@State
	app!: Store['app'];

	showingThanks = false;
	isClaimOnly = false;

	game: Game = null as any;
	bundle: GameBundle | null = null;
	keyGroup: KeyGroup | null = null;
	packagePayload: GamePackagePayloadModel | null = null;

	canToggleDescription = false;
	showingFullDescription = false;

	customGameMessages: CustomGameMessage[] = [];

	Environment = Environment;

	created() {
		this.showingThanks = typeof this.$route.query.thanks !== 'undefined';

		this.game = new Game(this.payload.game);
		this.bundle = this.payload.bundle ? new GameBundle(this.payload.bundle) : null;
		this.keyGroup = this.payload.keyGroup ? new KeyGroup(this.payload.keyGroup) : null;
		this.setPageTheme(this.game.theme || null);

		if (
			this.keyGroup &&
			(this.keyGroup.type === KeyGroup.TYPE_USER ||
				this.keyGroup.type === KeyGroup.TYPE_ANONYMOUS_CLAIM)
		) {
			this.isClaimOnly = true;
			return;
		}

		this.customGameMessages = this.payload.customMessages || [];

		if (this.payload.packages && this.payload.packages.length) {
			this.packagePayload = new GamePackagePayloadModel(this.payload);
		}
	}

	destroyed() {
		this.setPageTheme(null);
	}

	claim() {
		this.$emit('claim', this.game);
	}
}
