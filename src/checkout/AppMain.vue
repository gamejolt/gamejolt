<script lang="ts" setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import AppButton from '../_common/button/AppButton.vue';
import { AppClientBase, ClientHistoryNavigator } from '../_common/client/safe-exports';
import { Connection } from '../_common/connection/connection-service';
import AppContactLink from '../_common/contact-link/AppContactLink.vue';
import { Environment } from '../_common/environment/environment.service';
import AppErrorPage from '../_common/error/page/AppErrorPage.vue';
import { formatDate } from '../_common/filters/date';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { useCommonStore } from '../_common/store/common-store';
import AppTranslate from '../_common/translate/AppTranslate.vue';
import { loadCurrentLanguage } from '../_common/translate/translate.service';
import AppUserBar from '../_common/user/user-bar/AppUserBar.vue';
import { touchUser } from '../_common/user/user.model';

const { user } = useCommonStore();
const curDate = new Date();

onMounted(() => {
	// Will load the user in asynchronously so that the user-bar in the
	// shell will get loaded with a user.
	touchUser();

	loadCurrentLanguage();
});

function navigateBack() {
	ClientHistoryNavigator?.back();
}
</script>

<template>
	<AppCommonShell :class="{ 'is-client-offline': Connection.isClientOffline }">
		<div id="shell">
			<div id="header" class="theme-dark">
				<AppUserBar :user="user">
					<AppButton v-if="GJ_IS_DESKTOP_APP" icon="chevron-left" @click="navigateBack()">
						<AppTranslate>Back to Game</AppTranslate>
					</AppButton>
				</AppUserBar>
			</div>

			<div id="content">
				<AppErrorPage>
					<RouterView />
				</AppErrorPage>
			</div>

			<template v-if="GJ_IS_DESKTOP_APP">
				<AppClientBase />
			</template>
		</div>

		<footer id="footer">
			<div class="container">
				<div class="row">
					<div class="col-sm-6">
						<p class="footer-links">
							<AppContactLink email="contact@gamejolt.com">
								Contact Game Jolt
							</AppContactLink>
							&nbsp; | &nbsp;
							<a :href="Environment.baseUrl + '/terms'" target="_blank">Terms</a>
							&nbsp; | &nbsp;
							<a :href="Environment.baseUrl + '/privacy'" target="_blank">
								Privacy Policy
							</a>
							<template v-if="!GJ_IS_DESKTOP_APP">
								&nbsp; | &nbsp;
								<a :href="Environment.baseUrl + '/cookies'" target="_blank">
									Cookie Policy
								</a>
							</template>
						</p>
					</div>
					<div class="col-sm-6">
						<p class="footer-copyright">
							&copy; {{ formatDate(curDate, 'yyyy') }} Game Jolt Inc.
						</p>
					</div>
				</div>
			</div>
		</footer>
	</AppCommonShell>
</template>
