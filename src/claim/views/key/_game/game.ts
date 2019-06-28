import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import { GameBundle } from 'game-jolt-frontend-lib/components/game-bundle/game-bundle.model';
import {
	CustomMessage as CustomGameMessage,
	Game,
} from 'game-jolt-frontend-lib/components/game/game.model';
import AppGamePackageCard from 'game-jolt-frontend-lib/components/game/package/card/card.vue';
import { GamePackagePayloadModel } from 'game-jolt-frontend-lib/components/game/package/package-payload.model';
import { KeyGroup } from 'game-jolt-frontend-lib/components/key-group/key-group.model';
import { ThemeMutation, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import { Store } from '../../../store/index';

@Component({
	components: {
		AppJolticon,
		AppFadeCollapse,
		AppGamePackageCard,
		AppMediaItemCover,
		AppContentViewer,
	},
})
export default class AppKeyGame extends Vue {
	@Prop()
	payload!: any;

	@Prop()
	loginUrl!: string;

	@Prop()
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
