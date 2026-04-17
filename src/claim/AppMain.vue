<script lang="ts" setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

import AppContactLink from '~common/contact-link/AppContactLink.vue';
import { Environment } from '~common/environment/environment.service';
import AppErrorPage from '~common/error/page/AppErrorPage.vue';
import { formatDate } from '~common/filters/date';
import AppCommonShell from '~common/shell/AppCommonShell.vue';
import { useCommonStore } from '~common/store/common-store';
import { loadCurrentLanguage } from '~common/translate/translate.service';
import { touchUser } from '~common/user/user.model';
import AppUserBar from '~common/user/user-bar/AppUserBar.vue';

const { user } = useCommonStore();
const curDate = new Date();

onMounted(() => {
	// Will load the user in asynchronously so that the user-bar in the
	// shell will get loaded with a user.
	touchUser();

	loadCurrentLanguage();
});
</script>

<template>
	<AppCommonShell>
		<div id="shell">
			<div id="header">
				<AppUserBar :user="user" />
			</div>

			<div id="content">
				<AppErrorPage>
					<RouterView />
				</AppErrorPage>
			</div>
		</div>

		<footer id="footer">
			<div class="gj-container">
				<div class="row">
					<div class="col-sm-6">
						<p class="footer-links">
							<AppContactLink email="contact@gamejolt.com">
								Contact Game Jolt
							</AppContactLink>

							<br />

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
