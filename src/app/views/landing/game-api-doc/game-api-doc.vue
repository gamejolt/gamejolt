<script lang="ts">
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import nav from '../../../../lib/doc-game-api/v1.x/nav.json';
import { imageJolt } from '../../../img/images';

@Options({
	name: 'RouteLandingGameApiDoc',
	components: {
		AppThemeSvg,
	},
})
@OptionsForLegacyRoute()
export default class RouteLandingGameApiDoc extends LegacyRouteComponent {
	readonly nav = nav;
	readonly imageJolt = imageJolt;

	get routeTitle() {
		return this.$gettext(`Game API Documentation`);
	}

	inPath(url: string, exact = false) {
		if (exact) {
			return '/' + this.$route.params.path === url;
		}
		return ('/' + this.$route.params.path).indexOf(url) !== -1;
	}
}
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
							<AppTranslate>Game API</AppTranslate>
							<sup>
								<AppTranslate>Documentation</AppTranslate>
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
									<router-link
										:to="`/game-api/doc${item.url}`"
										:class="inPath(item.url) ? 'active' : ''"
									>
										{{ item.title }}
									</router-link>
									<ul v-if="item.nav && item.nav.length > 0 && inPath(item.url)">
										<li v-for="child of item.nav" :key="child.url">
											<router-link
												:to="`/game-api/doc${child.url}`"
												:class="inPath(child.url, true) ? 'active' : ''"
											>
												{{ child.title }}
											</router-link>
										</li>
									</ul>
								</li>
							</ul>
						</nav>
					</div>

					<div class="col-sm-9 col-sm-pull-3 col-lg-7 col-lg-pull-3">
						<router-view class="-content" />
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
