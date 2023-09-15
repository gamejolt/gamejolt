<script lang="ts">
import { mixins, Options, Prop, Watch } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import {
	$saveGameBuild,
	GameBuildModel,
	GameBuildType,
} from '../../../../../_common/game/build/build.model';
import { GameModel } from '../../../../../_common/game/game.model';
import { GamePackageModel } from '../../../../../_common/game/package/package.model';
import { GameReleaseModel } from '../../../../../_common/game/release/release.model';

type NewGameBuildFormModel = GameBuildModel & {
	file: File;
};

class Wrapper extends BaseForm<NewGameBuildFormModel> {}

@Options({
	components: {
		AppFormControlUpload,
		AppExpand,
	},
})
export default class FormGameNewBuild extends mixins(Wrapper) implements FormOnLoad {
	modelClass = GameBuildModel as any;
	modelSaveHandler = $saveGameBuild;

	@Prop(String) type!: 'downloadable' | 'browser';
	@Prop(Object) game!: GameModel;
	@Prop(Object) package!: GamePackageModel;
	@Prop(Object) release!: GameReleaseModel;
	@Prop(Array) builds!: GameBuildModel[];

	maxFilesize = 0;
	restrictedPlatforms: string[] = [];
	forceOther = false;
	romTypes: string[] = [];

	private browserTypes: { [ext: string]: string } = {};

	get loadUrl() {
		return `/web/dash/developer/games/builds/save/${this.game.id}/${this.package.id}/${this.release.id}`;
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
			.filter(build => build.type !== GameBuildType.Downloadable)
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

	created() {
		this.form.reloadOnSubmit = true;
		this.form.warnOnDiscard = false;
	}

	onInit() {
		// Set the game ID on the form model from the game passed in.
		// TODO(fix-form-saving) 'browser' doesn't exist, what is this typing meant to be?
		this.setField('type', this.type);
		this.setField('game_id', this.game.id);
		this.setField('game_package_id', this.package.id);
		this.setField('game_release_id', this.release.id);

		this.browserTypes = {
			'.zip': GameBuildType.Html,
			'.swf': GameBuildType.Flash,
			'.unity3d': GameBuildType.Unity,
		};
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.restrictedPlatforms = payload.restrictedPlatforms;
		this.forceOther = payload.forceOther;
		this.romTypes = payload.romTypes;

		// ROM types can change, so we pull from server.
		if (this.romTypes) {
			for (const ext of this.romTypes) {
				this.browserTypes[ext] = GameBuildType.Rom;
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

		this.form.submit();
	}
}
</script>

<template>
	<AppForm class="game-new-build-form" :controller="form">
		<!--
		Can only add files. Can't edit builds anymore.
		They need to release a new version to do that.
	-->
		<AppFormGroup
			name="file"
			:label="$gettext('Upload File')"
			:hide-label="true"
			:optional="true"
		>
			<AppFormControlUpload
				:validators="[validateFilesize(maxFilesize)]"
				:accept="uploadAccept"
				@changed="submit"
			/>

			<AppFormControlErrors :label="$gettext(`file`)" />

			<AppExpand :when="hasBrowserTypeError">
				<br />
				<div class="alert alert-notice sans-margin-bottom">
					<AppTranslate>
						You can't upload multiple browser builds of the same type into the same
						release. If you're trying to update your build, add a new release first.
					</AppTranslate>
				</div>
			</AppExpand>

			<p v-if="type === 'browser'" class="help-block">
				<AppTranslate>
					For HTML builds, upload a .zip archive containing all of your build's files and
					assets. There must be an index.html file in the root folder.
				</AppTranslate>
			</p>
		</AppFormGroup>
	</AppForm>
</template>
