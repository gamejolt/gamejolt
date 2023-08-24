<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { GameDevelopmentStatus, GameModel } from '../../../../../_common/game/game.model';
import { BaseModal } from '../../../../../_common/modal/base';

@Options({})
export default class AppGameDevStageConfirmModal extends mixins(BaseModal) {
	@Prop(Object) game!: GameModel;
	@Prop(Number) stage!: number;

	from = '';
	to = '';
	action = '';

	fromTranslated = '';
	toTranslated = '';

	created() {
		this.from = this._getStatusString(this.game.development_status);
		this.to = this._getStatusString(this.stage);
		this.action = `${this.from}:${this.to}`;

		this.fromTranslated = this._getStatusTranslated(this.game.development_status);
		this.toTranslated = this._getStatusTranslated(this.stage);
	}

	private _getStatusTranslated(stage: number) {
		if (stage === GameDevelopmentStatus.Devlog) {
			return this.$gettext('devlog-only');
		} else if (stage === GameDevelopmentStatus.Wip) {
			return this.$gettext('early access');
		}

		return this.$gettext('complete');
	}

	private _getStatusString(stage: number) {
		if (stage === GameDevelopmentStatus.Devlog) {
			return 'devlog';
		} else if (stage === GameDevelopmentStatus.Wip) {
			return 'wip';
		}

		return 'complete';
	}

	proceed() {
		this.modal.resolve(true);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate>Are you sure?</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<p>
				<AppTranslate
					:translate-params="{
						from: fromTranslated,
						to: toTranslated,
					}"
				>
					When switching your game page from a %{ from } page to a %{ to } page, the
					follow changes will occur:
				</AppTranslate>
			</p>

			<ul>
				<!-- Builds -->
				<li v-if="from === 'devlog'">
					<AppTranslate>
						Public packages/builds for your game will now be visible to everyone.
					</AppTranslate>
				</li>
				<li v-else-if="to === 'devlog'">
					<AppTranslate>
						Any public packages/builds for your game will be hidden while your game page
						is devlog-only.
					</AppTranslate>
				</li>

				<!-- Devlog Tab -->
				<li v-if="from === 'devlog'">
					<AppTranslate>
						Your game's devlog feed will be moved into its own tab. You can continue
						posting devlog posts for your game.
					</AppTranslate>
				</li>
				<li v-else-if="to === 'devlog'">
					<AppTranslate
						>Your game's devlog feed will move back to your game's main
						page.</AppTranslate
					>
				</li>

				<!-- Published Date -->
				<li
					v-if="
						action === 'devlog:wip' ||
						action === 'devlog:complete' ||
						action === 'wip:complete'
					"
				>
					<AppTranslate
						>Your game will be added to the top of the "new game" list.</AppTranslate
					>
				</li>
			</ul>
		</div>

		<div class="modal-footer">
			<AppButton primary @click="proceed()">
				<AppTranslate>Proceed</AppTranslate>
			</AppButton>
			<AppButton trans @click="cancel()">
				<AppTranslate>Cancel</AppTranslate>
			</AppButton>
		</div>
	</AppModal>
</template>
