<script lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import AppPageHeader from '~app/components/page-header/AppPageHeader.vue';
import AppShellPageBackdrop from '~app/components/shell/AppShellPageBackdrop.vue';
import { useClientLibraryStore } from '~app/store/client-library/index';
import AppLibraryInstalledGame from '~app/views/library/installed/AppLibraryInstalledGame.vue';
import AppAlertDismissable from '~common/alert/dismissable/AppAlertDismissable.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
const { games } = useClientLibraryStore();

const gamesByTitle = computed(() => {
	return [...games.value].sort((a, b) =>
		a.title.toLowerCase().localeCompare(b.title.toLowerCase())
	);
});

createAppRoute({
	routeTitle: computed(() => $gettext(`Installed Games`)),
});
</script>

<template>
	<AppPageHeader>
		<h1><AppTranslate>Installed Games</AppTranslate></h1>
		<br />
	</AppPageHeader>

	<AppShellPageBackdrop>
		<section class="section">
			<div class="container">
				<AppAlertDismissable alert-type="info" dismiss-key="library.install-location-msg">
					<AppJolticon icon="info-circle" middle />
					{{ ' ' }}
					<AppTranslate
						translate-comment="Short message to remind them that they can change install location at any time in their settings."
					>
						You can change the location where games are installed at any time in your
						settings.
					</AppTranslate>
					{{ ' ' }}
					<RouterLink :to="{ name: 'dash.account.device-settings' }">
						<AppTranslate>Go to Settings?</AppTranslate>
					</RouterLink>
				</AppAlertDismissable>

				<div v-if="!games.length" class="alert alert-notice">
					<AppTranslate
						translate-comment="The message shown when there are no games installed yet in their library."
					>
						Your installed games show up here... that is, once you have some!
					</AppTranslate>
				</div>
				<div v-else class="row">
					<div v-for="game of gamesByTitle" :key="game.id" class="col-md-6 col-lg-4">
						<AppLibraryInstalledGame :game="game" />
					</div>
				</div>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
