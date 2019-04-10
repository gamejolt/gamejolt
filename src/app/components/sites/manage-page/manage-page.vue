<template>
	<div>
		<app-nav-tab-list>
			<ul>
				<li>
					<router-link
						:to="{
							name: $route.name,
							params: {
								siteTab: null,
							},
						}"
						:class="{ active: tab === 'template' }"
					>
						<!-- @click="tab = 'template'" -->
						<span class="page-active-tab" v-if="templateEnabled">
							<app-jolticon icon="checkbox" />
						</span>
						<translate>Use a Template</translate>
					</router-link>
				</li>
				<li>
					<router-link
						:to="{
							name: $route.name,
							params: {
								siteTab: 'static',
							},
						}"
						:class="{ active: tab === 'static' }"
					>
						<!-- @click="tab = 'static'" -->
						<span class="page-active-tab" v-if="staticEnabled">
							<app-jolticon icon="checkbox" />
						</span>
						<translate>Upload Your Own</translate>
					</router-link>
				</li>
			</ul>
			<ul class="pull-right">
				<li>
					<router-link
						:to="{
							name: $route.name,
							params: {
								siteTab: 'domain',
							},
						}"
						:class="{ active: tab === 'domain' }"
					>
						<!-- @click="tab = 'domain'" -->
						<translate>Custom Domain</translate>
					</router-link>
				</li>
			</ul>
		</app-nav-tab-list>

		<div
			class="row"
			v-if="(templateEnabled && tab === 'template') || (staticEnabled && tab === 'static')"
		>
			<div class="col-sm-9">
				<div class="alert full-bleed-xs" v-if="templateEnabled">
					<p>
						<strong><translate>Your site is turned on and active.</translate></strong>
					</p>
					<p><translate>You can customize it using the site editor below.</translate></p>
				</div>

				<div class="alert full-bleed-xs" v-if="staticEnabled">
					<p>
						<strong><translate>Your static site is turned on and active.</translate></strong>
					</p>
					<p><translate>You can upload new static site builds at any time.</translate></p>
				</div>
			</div>
			<div class="col-sm-3">
				<div class="clearfix">
					<app-button
						class="anim-fade-in no-animate-leave pull-right"
						@click="disable()"
						v-app-tooltip="
							$gettext(
								`This will turn your Site off completely and it will no longer be accessible.`
							)
						"
					>
						<translate>Disable</translate>
					</app-button>
				</div>
				<br />
			</div>
		</div>

		<app-sites-manage-page-template
			v-if="tab === 'template'"
			:site="site"
			:enabled="templateEnabled"
			:static-enabled="staticEnabled"
		/>

		<app-sites-manage-page-static
			v-else-if="tab === 'static'"
			:site="site"
			:enabled="staticEnabled"
			:template-enabled="templateEnabled"
		/>

		<app-sites-manage-page-domain v-else-if="tab === 'domain'" :site="site" :game="game" />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.active-tab
	.jolticon
		theme-prop('color', 'link')
		margin: 0
		margin-right: 5px
</style>

<script lang="ts" src="./manage-page"></script>
