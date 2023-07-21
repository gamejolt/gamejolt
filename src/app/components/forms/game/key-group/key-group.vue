<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../_common/filters/number';
import { BaseForm, FormOnSubmitSuccess } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import {
	GamePackage,
	GamePackageVisibility,
} from '../../../../../_common/game/package/package.model';
import { KeyGroup } from '../../../../../_common/key-group/key-group.model';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

class Wrapper extends BaseForm<KeyGroup> {}

@Options({
	components: {
		AppExpand,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class FormGameKeyGroup extends mixins(Wrapper) implements FormOnSubmitSuccess {
	modelClass = KeyGroup;

	@Prop(Object) game!: Game;
	@Prop(Array) packages!: GamePackage[];

	readonly formatNumber = formatNumber;
	readonly KeyGroup = KeyGroup;
	readonly GamePackage = GamePackage;
	readonly GamePackageVisibilityPrivate = GamePackageVisibility.Private;

	get arePackagesChosen() {
		return this.formModel.package_ids.length > 0;
	}

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('game_id', this.game.id);
	}

	onSubmitSuccess(response: any): void {
		this.game.assign(response.game);
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup v-if="method === 'add'" name="type" :label="$gettext(`Key Type`)">
			<div class="radio">
				<label>
					<AppFormControlRadio :value="KeyGroup.TYPE_USER" />
					<AppTranslate>User</AppTranslate>
					&mdash;
					<AppTranslate class="help-inline">
						Only the Game Jolt users you specify will be able to access and claim your
						game. Useful for testers, friends, etc.
					</AppTranslate>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="KeyGroup.TYPE_ANONYMOUS_CLAIM" />
					<AppTranslate>Claim-Only</AppTranslate>
					&mdash;
					<AppTranslate class="help-inline">
						Game can only be accessed once the key is claimed by a Game Jolt user.
						Useful for key giveaways where you'd like only one person to be able to
						claim per key, but you don't care who claims it.
					</AppTranslate>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="KeyGroup.TYPE_ANONYMOUS" />
					<AppTranslate>Unrestricted (Anonymous)</AppTranslate>
					&mdash;
					<AppTranslate class="help-inline">
						Anyone can access the game through the key page until the key has been
						claimed by a Game Jolt user. Useful for press keys, bundles, or any time you
						need to anonymously give out keys and see which have been claimed.
					</AppTranslate>
				</label>
			</div>
			<div class="radio">
				<label>
					<AppFormControlRadio :value="KeyGroup.TYPE_EMAIL" />
					<AppTranslate>Unrestricted (Email)</AppTranslate>
					&mdash;
					<AppTranslate class="help-inline">
						Behaves exactly like Unrestricted keys, except they can be retrieved at any
						time through a retrieval page by entering their email address. Useful for
						assigning keys for Kickstarter rewards, etc
					</AppTranslate>
				</label>
			</div>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup v-if="!!formModel.type" name="name" :label="$gettext(`Label`)">
			<p class="help-block">
				<AppTranslate>
					This is just so you can keep track of your groups. It won't be shown to users.
				</AppTranslate>
			</p>
			<AppFormControl type="text" :validators="[validateMaxLength(150)]" />
		</AppFormGroup>

		<AppFormGroup
			v-if="
				!!formModel.type &&
				method === 'add' &&
				(formModel.type === KeyGroup.TYPE_ANONYMOUS ||
					formModel.type === KeyGroup.TYPE_ANONYMOUS_CLAIM)
			"
			name="amount"
			:label="$gettext(`# of Keys to Generate`)"
		>
			<AppFormControl
				type="number"
				step="1"
				min="1"
				max="20000"
				:validators="[validateMinValue(1), validateMaxValue(20000)]"
			/>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			v-if="!!formModel.type && method === 'add' && formModel.type === KeyGroup.TYPE_EMAIL"
			name="emails"
			:label="$gettext(`Email Addresses`)"
		>
			<p class="help-block">
				<AppTranslate>
					Paste one email address per line, or separate them by commas.
				</AppTranslate>
			</p>
			<AppFormControlTextarea rows="10" :validators="[validateMaxLength(25000)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			v-if="!!formModel.type && method === 'add' && formModel.type === KeyGroup.TYPE_USER"
			name="users"
			:label="$gettext(`Usernames`)"
		>
			<p class="help-block">
				<AppTranslate>
					Paste one username per line, or separate them by commas.
				</AppTranslate>
			</p>
			<AppFormControlTextarea rows="10" :validators="[validateMaxLength(25000)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			v-if="!!formModel.type"
			name="package_ids"
			:label="$gettext(`Access Permissions`)"
		>
			<p class="help-block">
				<AppTranslate>
					The packages for your game that this key group will give access to.
				</AppTranslate>
			</p>

			<div v-for="pkg of packages" :key="pkg.id" class="checkbox">
				<label>
					<AppFormControlCheckbox :value="pkg.id" />
					<span
						v-if="pkg.visibility === GamePackageVisibilityPrivate"
						v-app-tooltip="
							$gettext(
								`This package is private, but will be accessible in this key group if you assign it.`
							)
						"
						class="tag tag-notice"
					>
						<AppTranslate>Private</AppTranslate>
					</span>
					{{ pkg.title || game.title }}
				</label>
			</div>
		</AppFormGroup>

		<AppExpand :when="serverErrors['num-keys']">
			<div class="alert alert-notice">
				<AppTranslate
					:translate-params="{
						max: formatNumber(20000),
					}"
				>
					You can only have a max of %{ max } keys in a single key group.
				</AppTranslate>
			</div>
		</AppExpand>

		<AppFormButton v-if="!!formModel.type && changed && arePackagesChosen">
			<AppTranslate>Save Key Group</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
