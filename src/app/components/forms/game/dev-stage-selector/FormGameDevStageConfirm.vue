<script lang="ts" setup>
import AppButton from '../../../../../_common/button/AppButton.vue';
import { GameDevelopmentStatus, GameModel } from '../../../../../_common/game/game.model';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';

type Props = {
	game: GameModel;
	stage: number;
};

const { game, stage } = defineProps<Props>();

const modal = useModal()!;

function getStatusTranslated(s: number) {
	if (s === GameDevelopmentStatus.Devlog) {
		return $gettext('devlog-only');
	} else if (s === GameDevelopmentStatus.Wip) {
		return $gettext('early access');
	}
	return $gettext('complete');
}

function getStatusString(s: number) {
	if (s === GameDevelopmentStatus.Devlog) {
		return 'devlog';
	} else if (s === GameDevelopmentStatus.Wip) {
		return 'wip';
	}
	return 'complete';
}

const from = getStatusString(game.development_status);
const to = getStatusString(stage);
const action = `${from}:${to}`;
const fromTranslated = getStatusTranslated(game.development_status);
const toTranslated = getStatusTranslated(stage);

function proceed() {
	modal.resolve(true);
}

function cancel() {
	modal.resolve(false);
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
