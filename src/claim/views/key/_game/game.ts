import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./game.html?style=./game.styl';

import {
	Game,
	CustomMessage as CustomGameMessage,
} from '../../../../lib/gj-lib-client/components/game/game.model';
import { GameBundle } from '../../../../lib/gj-lib-client/components/game-bundle/game-bundle.model';
import { GamePackagePayloadModel } from '../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Store } from '../../../store/index';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppGamePackageCard } from '../../../../lib/gj-lib-client/components/game/package/card/card';
import { AppMediaItemCover } from '../../../../app/components/media-item/cover/cover';
import { KeyGroup } from '../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { LinkedKey } from '../../../../lib/gj-lib-client/components/linked-key/linked-key.model';

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
	@Prop() payload: any;
	@Prop() loginUrl: string;
	@Prop() accessKey?: string;

	@State app: Store['app'];

	showingThanks = false;
	isClaimOnly = false;

	game: Game = null as any;
	bundle: GameBundle | null = null;
	keyGroup: KeyGroup | null = null;
	linkedKeys: LinkedKey[] = [];
	packagePayload: GamePackagePayloadModel | null = null;

	canToggleDescription = false;
	showingFullDescription = false;

	customGameMessage: CustomGameMessage | null = null;

	Environment = Environment;
	LinkedKey = LinkedKey;

	created() {
		this.showingThanks = typeof this.$route.query.thanks !== 'undefined';

		this.game = new Game(this.payload.game);
		this.bundle = this.payload.bundle ? new GameBundle(this.payload.bundle) : null;
		this.keyGroup = this.payload.keyGroup ? new KeyGroup(this.payload.keyGroup) : null;

		if (
			this.keyGroup &&
			(this.keyGroup.type === KeyGroup.TYPE_USER ||
				this.keyGroup.type === KeyGroup.TYPE_ANONYMOUS_CLAIM)
		) {
			this.isClaimOnly = true;
			return;
		}

		this.linkedKeys = LinkedKey.populate(this.payload.linkedKeys);

		if (this.payload.customMessage) {
			this.customGameMessage = this.payload.customMessage;
			switch (this.customGameMessage!.type) {
				case 'alert': {
					this.customGameMessage!.class = 'alert-warning';
					break;
				}
				case 'info':
				default: {
					this.customGameMessage!.class = 'alert-info';
					break;
				}
			}
		}

		if (this.payload.packages && this.payload.packages.length) {
			this.packagePayload = new GamePackagePayloadModel(this.payload);
		}
	}

	claim() {
		this.$emit('claim', this.game);
	}
}
