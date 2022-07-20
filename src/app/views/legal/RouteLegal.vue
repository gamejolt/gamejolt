<script lang="ts">
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';

export default {
	...defineAppRouteOptions({
		resolver: () => User.touch(),
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-9 col-md-8 col-lg-7 col-lg-offset-1">
					<router-view />
				</div>
				<div class="col-sm-3 col-md-4 col-lg-3 hidden-xs">
					<br />
					<br />
					<br />
					<nav class="platform-list">
						<ul>
							<li>
								<router-link :to="{ name: 'legal.terms' }" active-class="active">
									<AppTranslate>Terms of Use</AppTranslate>
								</router-link>
							</li>
							<li>
								<router-link :to="{ name: 'legal.privacy' }" active-class="active">
									<AppTranslate>Privacy Policy</AppTranslate>
								</router-link>
							</li>
							<li>
								<router-link :to="{ name: 'legal.cookies' }" active-class="active">
									<AppTranslate>Cookie Policy</AppTranslate>
								</router-link>
							</li>
							<li>
								<router-link :to="{ name: 'legal.ads' }" active-class="active">
									<AppTranslate>Advertising Platforms</AppTranslate>
								</router-link>
							</li>
							<li>
								<router-link :to="{ name: 'legal.deletion' }" active-class="active">
									<AppTranslate>Account Deletion</AppTranslate>
								</router-link>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</div>
	</section>
</template>
