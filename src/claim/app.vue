<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import AppContactLink from '../_common/contact-link/contact-link.vue';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import { Environment } from '../_common/environment/environment.service';
import AppErrorPage from '../_common/error/page/page.vue';
import { formatDate } from '../_common/filters/date';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { useCommonStore } from '../_common/store/common-store';
import { loadCurrentLanguage } from '../_common/translate/translate.service';
import AppUserBar from '../_common/user/user-bar/user-bar.vue';
import { User } from '../_common/user/user.model';

@Options({
	components: {
		AppCommonShell,
		AppErrorPage,
		AppUserBar,
		AppCookieBanner,
		AppContactLink,
	},
})
export default class App extends Vue {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	curDate = new Date();

	readonly Environment = Environment;
	readonly formatDate = formatDate;

	mounted() {
		// Will load the user in asynchronously so that the user-bar in the
		// shell will get loaded with a user.
		User.touch();

		loadCurrentLanguage();
	}
}
</script>

<template>
	<app-common-shell>
		<app-cookie-banner />

		<div id="shell">
			<div id="header">
				<app-user-bar :user="app.user" site="main" :hide-site-selector="true" />
			</div>

			<div id="content">
				<app-error-page>
					<router-view />
				</app-error-page>
			</div>
		</div>

		<footer id="footer">
			<div class="container">
				<div class="row">
					<div class="col-sm-6">
						<p class="footer-links">
							<app-contact-link email="contact@gamejolt.com">
								Contact Game Jolt
							</app-contact-link>
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
	</app-common-shell>
</template>
