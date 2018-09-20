import View from '!view!./game.html?style=./game.styl';
import { ThemeMutation, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { GameBundle } from '../../../../lib/gj-lib-client/components/game-bundle/game-bundle.model';
import {
	CustomMessage as CustomGameMessage,
	Game,
} from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppGamePackageCard } from '../../../../lib/gj-lib-client/components/game/package/card/card';
import { GamePackagePayloadModel } from '../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { KeyGroup } from '../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppMediaItemCover } from '../../../../_common/media-item/cover/cover';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
		AppFadeCollapse,
		AppGamePackageCard,
		AppMediaItemCover,
	},
})
export class AppKeyGame extends Vue {
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
