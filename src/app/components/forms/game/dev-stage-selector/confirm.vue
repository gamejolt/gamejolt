<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Game } from '../../../../../_common/game/game.model';
import { BaseModal } from '../../../../../_common/modal/base';

@Options({})
export default class AppGameDevStageConfirmModal extends mixins(BaseModal) {
	@Prop(Object) game!: Game;
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
		if (stage === Game.DEVELOPMENT_STATUS_DEVLOG) {
			return this.$gettext('devlog-only');
		} else if (stage === Game.DEVELOPMENT_STATUS_WIP) {
			return this.$gettext('early access');
		}

		return this.$gettext('complete');
	}

	private _getStatusString(stage: number) {
		if (stage === Game.DEVELOPMENT_STATUS_DEVLOG) {
			return 'devlog';
		} else if (stage === Game.DEVELOPMENT_STATUS_WIP) {
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
	<app-modal>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Are you sure?</translate>
			</h2>
		</div>

		<div class="modal-body">
			<p>
				<translate
					:translate-params="{
						from: fromTranslated,
						to: toTranslated,
					}"
				>
					When switching your game page from a %{ from } page to a %{ to } page, the follow changes
					will occur:
				</translate>
			</p>

			<ul>
				<!-- Builds -->
				<li v-if="from === 'devlog'">
					<translate>
						Public packages/builds for your game will now be visible to everyone.
					</translate>
				</li>
				<li v-else-if="to === 'devlog'">
					<translate>
						Any public packages/builds for your game will be hidden while your game page is
						devlog-only.
					</translate>
				</li>

				<!-- Devlog Tab -->
				<li v-if="from === 'devlog'">
					<translate>
						Your game's devlog feed will be moved into its own tab. You can continue posting devlog
						posts for your game.
					</translate>
				</li>
				<li v-else-if="to === 'devlog'">
					<translate>Your game's devlog feed will move back to your game's main page.</translate>
				</li>

				<!-- Published Date -->
				<li
					v-if="
						action === 'devlog:wip' || action === 'devlog:complete' || action === 'wip:complete'
					"
				>
					<translate>Your game will be added to the top of the "new game" list.</translate>
				</li>
			</ul>
		</div>

		<div class="modal-footer">
			<app-button primary @click="proceed()">
				<translate>Proceed</translate>
			</app-button>
			<app-button trans @click="cancel()">
				<translate>Cancel</translate>
			</app-button>
		</div>
	</app-modal>
</template>
