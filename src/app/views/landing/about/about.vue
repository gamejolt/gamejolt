<script lang="ts">
import { Options } from 'vue-property-decorator';
import AppContactLink from '../../../../_common/contact-link/AppContactLink.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { imageJolt } from '../../../img/images';
import profileCros from './cros.jpg';
import profileThoro from './thoro.jpg';

@Options({
	name: 'RouteLandingAbout',
	components: {
		AppThemeSvg,
		AppContactLink,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForRoute()
export default class RouteLandingAbout extends BaseRouteComponent {
	readonly assetUrls = import.meta.globEager('./*.png');
	readonly Screen = Screen;
	readonly imageJolt = imageJolt;
	readonly profileCros = profileCros;
	readonly profileThoro = profileThoro;

	colors = {
		'#ccff00': 'black',
		'#2f7f6f': 'white',
		'#31d6ff': 'white',
		'#ff3fac': 'white',
	};

	disableRouteTitleSuffix = true;

	get routeTitle() {
		return this.$gettext(`About Game Jolt`);
	}
}
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
							and the people who love to make and play them, working its way into the
							lives of 150 million people!
						</p>
					</div>
				</div>
			</div>
		</section>

		<div class="landing-body">
			<section class="section">
				<div class="container">
					<h1 class="section-header text-center">A Love of Games</h1>

					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
							<p>
								Whether you're into sharing your fan art for the most popular games
								in the world or you spend your free time finding obscure games
								nobody has heard of, Game Jolt is a one-stop community for all of
								gaming.
							</p>
							<p>
								Connecting gamers and creators within game communities across PC,
								mobile and console, join communities like
								<a href="https://gamejolt.com/c/minecraft">Minecraft</a>,
								<a href="https://gamejolt.com/c/pokemon">Pokémon</a> and
								<a href="https://gamejolt.com/c/fnaf">FNaF</a> or try your hand at
								playing some of our
								<a href="https://gamejolt.com/games">favorite games</a>!
							</p>
							<p>
								We’ve extended our reach to a growing population of visual artists,
								musicians, streamers, writers, conversationalists, fan cultures, and
								the list goes on. Our
								<a href="https://gamejolt.com/communities">community</a> continues
								to demonstrate their widening range of interests making us the
								ultimate platform for billions of gamers!
							</p>
							<p>
								<a href="https://gamejolt.com/join">Join</a> over a hundred million
								gamers on Game Jolt and hundreds of thousands of creators!
							</p>
						</div>
					</div>

					<h1 class="text-center">Our Team</h1>

					<hr class="underbar underbar-center" />
					<br />

					<div class="row">
						<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
							<p>
								Our team is made up of gamers, developers, artists, musicians and
								publishers. We are building the platform for billions of gamers
								worldwide!
							</p>
							<div class="-staff">
								<div class="-staff-item">
									<a href="https://gamejolt.com/@thoro">
										<img :src="profileThoro" alt="thoro" class="-avatar" />
									</a>
									<strong>Yaprak</strong> <small>@thoro</small> <br />
									Co-founder / CEO
								</div>
								<div class="-staff-item">
									<a href="https://gamejolt.com/@cros">
										<img :src="profileCros" alt="cros" class="-avatar" />
									</a>
									<strong>David</strong> <small>@cros</small> <br />
									Co-founder / CTO
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
										:src="assetUrls['./gamejolt-logo-dark-1x.png'].default"
										alt="Game Jolt Logo Dark"
									/>
								</div>
								<div class="hidden-xs text-center">
									<img
										:src="assetUrls['./gamejolt-logo-dark-2x.png'].default"
										alt="Game Jolt Logo Dark"
									/>
								</div>

								<br />

								<div class="text-right">
									<span v-for="(size, i) of ['1x', '2x', '3x', '4x']" :key="size">
										<a
											:href="
												assetUrls['./gamejolt-logo-dark-' + size + '.png']
													.default
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
												:src="
													assetUrls['./gamejolt-bolt-dark-2x.png'].default
												"
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
														].default
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
												:src="
													assetUrls['./gamejolt-bolt-white-2x.png']
														.default
												"
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
														].default
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
												:src="
													assetUrls['./gamejolt-bolt-black-2x.png']
														.default
												"
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
														].default
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

					<p class="text-center">Wanna look like us? Check these hex codes out!</p>

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
	display: flex
	flex-direction: row
	justify-content: center

.-staff-item
	width: 100%
	max-width: 150px
	margin: 0 ($grid-gutter-width-xs / 2)
	text-align: center

	@media $media-sm-up
		margin: 0 ($grid-gutter-width / 2)

.-avatar
	img-responsive()
	img-circle()
	display: block
	margin-bottom: $line-height-computed
	border: 4px solid var(--theme-fg)
</style>
