import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import AppFormControlUpload from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload.vue';
import AppForm from 'game-jolt-frontend-lib/components/form-vue/form';
import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { GameBuild } from 'game-jolt-frontend-lib/components/game/build/build.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import { GameRelease } from 'game-jolt-frontend-lib/components/game/release/release.model';
import { Component, Prop, Watch } from 'vue-property-decorator';

type NewGameBuildFormModel = GameBuild & {
	file: File;
};

@Component({
	components: {
		AppFormControlUpload,
		AppExpand,
	},
})
export default class FormGameNewBuild extends BaseForm<NewGameBuildFormModel>
	implements FormOnInit, FormOnLoad {
	modelClass = GameBuild as any;
	resetOnSubmit = true;
	reloadOnSubmit = true;
	warnOnDiscard = false;

	@Prop(String) type!: 'downloadable' | 'browser';
	@Prop(Game) game!: Game;
	@Prop(GamePackage) package!: GamePackage;
	@Prop(GameRelease) release!: GameRelease;
	@Prop(Array) builds!: GameBuild[];

	$refs!: {
		form: AppForm;
	};

	maxFilesize = 0;
	restrictedPlatforms: string[] = [];
	forceOther = false;
	romTypes: string[] = [];

	private browserTypes: { [ext: string]: string } = {};

	get loadUrl() {
		return `/web/dash/developer/games/builds/save/${this.game.id}/${this.package.id}/${
			this.release.id
		}`;
	}

	get uploadAccept() {
		if (this.type !== 'browser') {
			return undefined;
		}

		return Object.keys(this.browserTypes).join(',');
	}

	get browserTypeValid() {
		if (this.type !== 'browser' || !this.builds || !this.formModel.file) {
			return true;
		}

		const releaseTypes = this.builds
			.filter(build => build.type !== GameBuild.TYPE_DOWNLOADABLE)
			.map(build => build.type);

		const accept = Object.entries(this.browserTypes)
			.filter(entry => {
				return releaseTypes.indexOf(entry[1]) === -1;
			})
			.map(entry => entry[0]);

		const fileType = this.formModel.file.name.slice(this.formModel.file.name.lastIndexOf('.'));
		return accept.indexOf(fileType) !== -1;
	}

	get hasBrowserTypeError() {
		return this.hasCustomError('browserType');
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

	@Watch('formModel.file')
	validateBrowserType() {
		if (!this.browserTypeValid) {
			this.setCustomError('browserType');
		} else {
			this.clearCustomError('browserType');
		}
	}

	submit() {
		if (!this.formModel.file) {
			return;
		}

		this.$refs.form.submit();
	}
}
