<script lang="ts" src="./app"></script>

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
