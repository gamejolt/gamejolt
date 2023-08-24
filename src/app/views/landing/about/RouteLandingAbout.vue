<script lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import AppContactLink from '../../../../_common/contact-link/AppContactLink.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import { arrayShuffle } from '../../../../utils/array';
import { imageJolt } from '../../../img/images';
import { routeLandingCreators } from '../creators/creators.route';

const assetUrls = import.meta.glob('./*.(png|jpg)', { eager: true, as: 'url' });

const colors = {
	'#ccff00': 'black',
	'#2f7f6f': 'white',
	'#31d6ff': 'white',
	'#ff3fac': 'white',
};

const staff = arrayShuffle([
	'ylivay',
	'nilllzz',
	'hapu',
	'babblingbendu',
	'kniteblargh',
	'lorac',
	'manu',
	'spyros',
	'19thgreeny',
]);

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext(`About Game Jolt`)),
	disableTitleSuffix: true,
});
</script>

<template>
	<div class="route-landing-about">
		<section class="section landing-header text-center">
			<div class="container">
				<h1>
					<AppThemeSvg
						v-app-tooltip="$gettext('This is a lightning bolt!')"
						class="bolt anim-fade-in-down"
						:src="imageJolt"
						alt=""
						strict-colors
					/>
				</h1>

				<br />

				<div class="row anim-fade-in-up stagger">
					<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
						<p class="lead">
							Game Jolt is one of the largest communities in existence for video games
							and the millions of people around the world who love them.
						</p>
					</div>
				</div>
			</div>
		</section>

		<div class="landing-body">
			<section class="section">
				<div class="container">
					<h1 class="section-header text-center">Best place for creators</h1>
					<hr class="underbar underbar-center" />

					<div class="row">
						<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
							<p>
								Whether you're into livestreaming together with your followers, or
								sharing your fan art for the most popular games, music, film and TV
								shows in the world, Game Jolt is the best platform for creators.
							</p>
							<p>
								<a href="https://gamejolt.com/join">Join</a> a growing population of
								visual artists, musicians, streamers, writers, conversationalists,
								fan cultures, and whatever it is that you do!
							</p>
							<p>
								<RouterLink :to="{ name: routeLandingCreators.name }">
									Learn more about being a creator on Game Jolt
								</RouterLink>
							</p>
						</div>
					</div>

					<h1 class="text-center">Our team</h1>
					<hr class="underbar underbar-center" />

					<div class="row">
						<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
							<div class="-staff">
								<div class="-staff-item">
									<a href="https://gamejolt.com/@thoro">
										<img
											:src="assetUrls['./profile-thoro.jpg']"
											alt="thoro"
											class="-avatar"
										/>
									</a>
									<strong>Yaprak</strong> <small>@thoro</small> <br />
									Co-founder / CEO
								</div>
								<div class="-staff-item">
									<a href="https://gamejolt.com/@cros">
										<img
											:src="assetUrls['./profile-cros.jpg']"
											alt="cros"
											class="-avatar"
										/>
									</a>
									<strong>David</strong> <small>@cros</small> <br />
									Co-founder / CTO
								</div>

								<div v-for="username of staff" :key="username" class="-staff-item">
									<a :href="`https://gamejolt.com/@${username}`">
										<img
											:src="assetUrls[`./profile-${username}.jpg`]"
											:alt="`@${username}`"
											class="-avatar"
										/>
									</a>
									<strong>@{{ username }}</strong>
								</div>
							</div>
							<br />

							<p>
								<strong>For support</strong>, email us at
								<AppContactLink email="contact@gamejolt.com">
									contact@gamejolt.com
								</AppContactLink>
							</p>

							<p>
								<strong>Press/business inquiries</strong>, email Yaprak DeCarmine at
								<AppContactLink email="yaprak@gamejolt.com">
									yaprak@gamejolt.com
								</AppContactLink>
							</p>
						</div>
					</div>

					<h1 class="text-center">Logo</h1>

					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
							<p>
								Please do not modify, recolor, or distort our logo. When resizing
								please attempt to use multiples: 2x, 4x, etc. Do not use filtering
								while resizing. Retain the crisp pixel look. It's a pain, we know.
							</p>

							<div class="well fill-darkest">
								<h5 class="section-header">Full Logo</h5>

								<br />

								<div class="visible-xs text-center">
									<img
										:src="assetUrls['./gamejolt-logo-dark-1x.png']"
										alt="Game Jolt Logo Dark"
									/>
								</div>
								<div class="hidden-xs text-center">
									<img
										:src="assetUrls['./gamejolt-logo-dark-2x.png']"
										alt="Game Jolt Logo Dark"
									/>
								</div>

								<br />

								<div class="text-right">
									<span v-for="(size, i) of ['1x', '2x', '3x', '4x']" :key="size">
										<a
											:href="
												assetUrls['./gamejolt-logo-dark-' + size + '.png']
											"
											target="_blank"
										>
											{{ size }}
										</a>
										<span v-if="i !== 3" class="dot-separator" />
									</span>
								</div>
							</div>

							<div class="row">
								<div class="col-sm-6">
									<div class="well fill-darkest">
										<h5 class="section-header">Bolt</h5>

										<br />

										<div class="text-center">
											<img
												:src="assetUrls['./gamejolt-bolt-dark-2x.png']"
												alt="Game Jolt Bolt Dark"
											/>
										</div>

										<br />

										<div class="text-right">
											<span
												v-for="(size, i) of ['1x', '2x', '3x', '4x']"
												:key="size"
											>
												<a
													:href="
														assetUrls[
															'./gamejolt-bolt-dark-' + size + '.png'
														]
													"
													target="_blank"
												>
													{{ size }}
												</a>
												<span v-if="i !== 3" class="dot-separator" />
											</span>
										</div>
									</div>
								</div>
							</div>

							<p>
								The below images should only be used when you are going for a
								no-color look. Only use straight white, or straight black. Don't
								recolor them.
							</p>

							<div class="row">
								<div class="col-sm-6">
									<div class="well fill-darkest">
										<h5 class="section-header">Bolt - Dark Backgrounds</h5>

										<br />

										<div class="text-center">
											<img
												:src="assetUrls['./gamejolt-bolt-white-2x.png']"
												alt="Game Jolt Bolt White"
											/>
										</div>

										<br />

										<div class="text-right">
											<span
												v-for="(size, i) of ['1x', '2x', '3x', '4x']"
												:key="size"
											>
												<a
													:href="
														assetUrls[
															'./gamejolt-bolt-white-' + size + '.png'
														]
													"
													target="_blank"
												>
													{{ size }}
												</a>
												<span v-if="i !== 3" class="dot-separator" />
											</span>
										</div>
									</div>
								</div>
								<div class="col-sm-6">
									<div class="well fill-gray">
										<h5 class="section-header">Bolt - Light Backgrounds</h5>

										<br />

										<div class="text-center">
											<img
												:src="assetUrls['./gamejolt-bolt-black-2x.png']"
												alt="Game Jolt Bolt Black"
											/>
										</div>

										<br />

										<div class="text-right">
											<span
												v-for="(size, i) of ['1x', '2x', '3x', '4x']"
												:key="size"
											>
												<a
													:href="
														assetUrls[
															'./gamejolt-bolt-black-' + size + '.png'
														]
													"
													target="_blank"
												>
													{{ size }}
												</a>
												<span v-if="i !== 3" class="dot-separator" />
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<h1 class="text-center">Digital Color Palette</h1>

					<hr class="underbar underbar-center" />
					<br />

					<p class="text-center">Wanna look like us? Check out these hex codes!</p>

					<div class="row">
						<div v-for="(fg, bg) of colors" :key="bg" class="col-sm-3">
							<div
								class="well -color-hex-code"
								:style="{
									color: fg,
									'background-color': bg,
								}"
							>
								{{ bg }}
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-color-hex-code
	font-family: $font-family-monospace
	font-weight: bold

.-staff
	display: grid
	grid-template-columns: repeat(auto-fit, minmax(0, 150px))
	gap: $grid-gutter-width
	justify-content: center

.-staff-item
	width: 100%
	text-align: center

.-avatar
	img-responsive()
	img-circle()
	display: block
	margin-bottom: $line-height-computed
	border: 4px solid var(--theme-fg)
</style>
