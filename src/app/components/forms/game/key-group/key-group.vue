<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { formatNumber } from '../../../../../_common/filters/number';
import { BaseForm, FormOnSubmitSuccess } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { KeyGroup } from '../../../../../_common/key-group/key-group.model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

class Wrapper extends BaseForm<KeyGroup> {}

@Options({
	components: {
		AppExpand,
	},
	directives: {
		AppTooltip,
	},
})
export default class FormGameKeyGroup extends mixins(Wrapper) implements FormOnSubmitSuccess {
	modelClass = KeyGroup;

	@Prop(Object) game!: Game;
	@Prop(Array) packages!: GamePackage[];

	readonly formatNumber = formatNumber;
	readonly KeyGroup = KeyGroup;
	readonly GamePackage = GamePackage;

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
	<app-form :controller="form">
		<app-form-group v-if="method === 'add'" name="type" :label="$gettext(`Key Type`)">
			<div class="radio">
				<label>
					<app-form-control-radio :value="KeyGroup.TYPE_USER" />
					<translate>User</translate>
					&mdash;
					<translate class="help-inline">
						Only the Game Jolt users you specify will be able to access and claim your
						game. Useful for testers, friends, etc.
					</translate>
				</label>
			</div>
			<div class="radio">
				<label>
					<app-form-control-radio :value="KeyGroup.TYPE_ANONYMOUS_CLAIM" />
					<translate>Claim-Only</translate>
					&mdash;
					<translate class="help-inline">
						Game can only be accessed once the key is claimed by a Game Jolt user.
						Useful for key giveaways where you'd like only one person to be able to
						claim per key, but you don't care who claims it.
					</translate>
				</label>
			</div>
			<div class="radio">
				<label>
					<app-form-control-radio :value="KeyGroup.TYPE_ANONYMOUS" />
					<translate>Unrestricted (Anonymous)</translate>
					&mdash;
					<translate class="help-inline">
						Anyone can access the game through the key page until the key has been
						claimed by a Game Jolt user. Useful for press keys, bundles, or any time you
						need to anonymously give out keys and see which have been claimed.
					</translate>
				</label>
			</div>
			<div class="radio">
				<label>
					<app-form-control-radio :value="KeyGroup.TYPE_EMAIL" />
					<translate>Unrestricted (Email)</translate>
					&mdash;
					<translate class="help-inline">
						Behaves exactly like Unrestricted keys, except they can be retrieved at any
						time through a retrieval page by entering their email address. Useful for
						assigning keys for Kickstarter rewards, etc
					</translate>
				</label>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group v-if="!!formModel.type" name="name" :label="$gettext(`Label`)">
			<p class="help-block">
				<translate>
					This is just so you can keep track of your groups. It won't be shown to users.
				</translate>
			</p>
			<app-form-control type="text" :validators="[validateMaxLength(150)]" />
		</app-form-group>

		<app-form-group
			v-if="
				!!formModel.type &&
				method === 'add' &&
				(formModel.type === KeyGroup.TYPE_ANONYMOUS ||
					formModel.type === KeyGroup.TYPE_ANONYMOUS_CLAIM)
			"
			name="amount"
			:label="$gettext(`# of Keys to Generate`)"
		>
			<app-form-control
				type="number"
				step="1"
				min="1"
				max="20000"
				:validators="[validateMinValue(1), validateMaxValue(20000)]"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			v-if="!!formModel.type && method === 'add' && formModel.type === KeyGroup.TYPE_EMAIL"
			name="emails"
			:label="$gettext(`Email Addresses`)"
		>
			<p class="help-block">
				<translate>Paste one email address per line, or separate them by commas.</translate>
			</p>
			<app-form-control-textarea rows="10" :validators="[validateMaxLength(25000)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			v-if="!!formModel.type && method === 'add' && formModel.type === KeyGroup.TYPE_USER"
			name="users"
			:label="$gettext(`Usernames`)"
		>
			<p class="help-block">
				<translate>Paste one username per line, or separate them by commas.</translate>
			</p>
			<app-form-control-textarea rows="10" :validators="[validateMaxLength(25000)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			v-if="!!formModel.type"
			name="package_ids"
			:label="$gettext(`Access Permissions`)"
		>
			<p class="help-block">
				<translate>
					The packages for your game that this key group will give access to.
				</translate>
			</p>

			<div v-for="pkg of packages" :key="pkg.id" class="checkbox">
				<label>
					<app-form-control-checkbox :value="pkg.id" />
					<span
						v-if="pkg.visibility === GamePackage.VISIBILITY_PRIVATE"
						v-app-tooltip="
							$gettext(
								`This package is private, but will be accessible in this key group if you assign it.`
							)
						"
						class="tag tag-notice"
					>
						<translate>Private</translate>
					</span>
					{{ pkg.title || game.title }}
				</label>
			</div>
		</app-form-group>

		<app-expand :when="serverErrors['num-keys']">
			<div class="alert alert-notice">
				<translate
					:translate-params="{
						max: formatNumber(20000),
					}"
				>
					You can only have a max of %{ max } keys in a single key group.
				</translate>
			</div>
		</app-expand>

		<app-form-button v-if="!!formModel.type && changed && arePackagesChosen">
			<translate>Save Key Group</translate>
		</app-form-button>
	</app-form>
</template>
