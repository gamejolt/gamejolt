<script lang="ts">
import { Options } from 'vue-property-decorator';
import nav from '../../../../lib/doc-game-api/v1.x/nav.json';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { imageJolt } from '../../../img/images';

@Options({
	name: 'RouteLandingGameApiDoc',
	components: {
		AppThemeSvg,
	},
})
export default class RouteLandingGameApiDoc extends BaseRouteComponent {
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
							<app-theme-svg
								:src="imageJolt"
								alt=""
								:width="17 * 3"
								:height="18 * 3"
								strict-colors
							/>
							<translate>Game API</translate>
							<sup>
								<translate>Documentation</translate>
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
