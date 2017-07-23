import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./new-build.html';

import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../../../../lib/gj-lib-client/components/game/release/release.model';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({
	components: {
		AppFormControlUpload,
	},
})
export class FormGameNewBuild extends BaseForm<GameBuild> implements FormOnInit, FormOnLoad {
	modelClass = GameBuild;
	resetOnSubmit = true;
	reloadOnSubmit = true;
	warnOnDiscard = false;

	@Prop(String) type: 'downloadable' | 'browser';
	@Prop(Game) game: Game;
	@Prop(GamePackage) package: GamePackage;
	@Prop(GameRelease) release: GameRelease;

	$refs: {
		form: AppForm;
	};

	maxFilesize = 0;
	restrictedPlatforms: string[] = [];
	forceOther = false;
	romTypes: string[] = [];

	private browserTypes: { [ext: string]: string } = {};

	get loadUrl() {
		return `/web/dash/developer/games/builds/save/${this.game.id}/${this.package.id}/${this.release
			.id}`;
	}

	onInit() {
		// Set the game ID on the form model from the game passed in.
		this.setField('type', this.type);
		this.setField('game_id', this.game.id);
		this.setField('game_package_id', this.package.id);
		this.setField('game_release_id', this.release.id);

		this.browserTypes = {
			'.zip': GameBuild.TYPE_HTML,
			'.swf': GameBuild.TYPE_FLASH,
			'.unity3d': GameBuild.TYPE_UNITY,
		};
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.restrictedPlatforms = payload.restrictedPlatforms;
		this.forceOther = payload.forceOther;
		this.romTypes = payload.romTypes;

		// ROM types can change, so we pull from server.
		if (this.romTypes) {
			for (let ext of this.romTypes) {
				this.browserTypes[ext] = GameBuild.TYPE_ROM;
			}
		}
	}

	get uploadAccept() {
		if (this.type === 'browser') {
			return Object.keys(this.browserTypes).join(',');
		}

		return undefined;
	}

	submit() {
		this.$refs.form.submit();
	}
}
