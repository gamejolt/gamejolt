<script lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { $gettext } from '../../../../_common/translate/translate.service';

import nav from '../../../../lib/doc-game-api/v1.x/nav.json';
import { imageJolt } from '../../../img/images';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const route = useRoute();

function inPath(url: string, exact = false) {
	if (exact) {
		return '/' + route.params.path === url;
	}
	return ('/' + route.params.path).indexOf(url) !== -1;
}

createAppRoute({
	routeTitle: computed(() => $gettext(`Game API Documentation`)),
});
</script>

<template>
	<div>
		<section class="section landing-header">
			<div class="container">
				<div class="row">
					<div class="col-lg-offset-1 col-lg-11">
						<h1>
							<AppThemeSvg
								:src="imageJolt"
								alt=""
								:width="17 * 3"
								:height="18 * 3"
								strict-colors
							/>
							{{ $gettext(`Game API`) }}
							{{ ' ' }}
							<sup>
								{{ $gettext(`Documentation`) }}
							</sup>
						</h1>
					</div>
				</div>
			</div>
		</section>

		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-lg-1" />
					<div class="col-sm-3 col-sm-push-9 col-lg-3 col-lg-push-8">
						<br />
						<br />
						<nav class="platform-list">
							<ul>
								<li v-for="item of nav" :key="item.url">
									<RouterLink
										:to="`/game-api/doc${item.url}`"
										:class="inPath(item.url) ? 'active' : ''"
									>
										{{ item.title }}
									</RouterLink>
									<ul v-if="item.nav && item.nav.length > 0 && inPath(item.url)">
										<li v-for="child of item.nav" :key="child.url">
											<RouterLink
												:to="`/game-api/doc${child.url}`"
												:class="inPath(child.url, true) ? 'active' : ''"
											>
												{{ child.title }}
											</RouterLink>
										</li>
									</ul>
								</li>
							</ul>
						</nav>
					</div>

					<div class="col-sm-9 col-sm-pull-3 col-lg-7 col-lg-pull-3">
						<RouterView class="-content" />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../../../_styles/common/tables'

.-content
	::v-deep(h1:first-child)
		margin-top: 0

	::v-deep(table)
		@extend .table

	::v-deep(img)
		img-responsive()
		rounded-corners-lg()
</style>
