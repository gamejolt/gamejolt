<template>
	<header
		class="section page-header"
		:class="{
			'has-controls': hasControls,
			'has-spotlight': hasSpotlight,
			'has-nav': hasNav && !hideNav,
			'-cover-auto-height': coverAutoHeight,
		}"
	>
		<section
			class="section page-header-cover fill-darker"
			:class="{
				'has-cover-image': !!coverMediaItem,
				'has-cover-buttons': showCoverButtons,
			}"
		>
			<div class="-cover-img" v-if="!!coverMediaItem">
				<app-media-item-cover
					:media-item="coverMediaItem"
					:max-height="coverMaxHeight"
					:blur="blurHeader"
				/>
			</div>

			<div class="page-header-cover-buttons" v-if="showCoverButtons">
				<div class="page-header-cover-buttons-inner">
					<svg class="page-header-cover-buttons-edge -left" viewBox="0 0 10 10">
						<path
							d="
						M0,0
						L10,0
						L10,10
						C5,10 5,0 0,0
						z
					"
						/>
					</svg>
					<svg class="page-header-cover-buttons-edge -right" viewBox="0 0 10 10">
						<path
							d="
						M10,0
						L0,0
						L0,10
						C5,10 5,0 10,0
						z
					"
						/>
					</svg>

					<slot name="cover-buttons" />
				</div>
			</div>

			<div class="container">
				<div class="row">
					<div :class="colClasses">
						<div class="page-header-content">
							<slot />
						</div>
					</div>
				</div>

				<div v-if="hasSpotlight" class="page-header-spotlight" :class="{ dark: spotlightDark }">
					<slot name="spotlight" />
				</div>
			</div>
		</section>

		<app-autoscroll-anchor
			v-if="hasNav && !hideNav"
			:anchor-key="autoscrollAnchorKey"
			:disabled="disableAutoscrollAnchor"
		>
			<app-scroll-affix :disabled="!(shouldAffixNav && Screen.isLg && Screen.height > 750)">
				<section class="section page-header-nav">
					<div class="container">
						<div class="row">
							<div :class="colClasses">
								<div class="row">
									<div v-if="hasControls" class="col-lg-4 col-lg-push-8">
										<div class="page-header-controls">
											<slot name="controls" />
										</div>
									</div>
									<div
										:class="{
											'col-lg-8 col-lg-pull-4': hasControls,
											'col-xs-12': !hasControls,
										}"
									>
										<slot name="nav" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</app-scroll-affix>
		</app-autoscroll-anchor>
	</header>
</template>

<style lang="stylus" src="./page-header.styl" scoped />

<script lang="ts" src="./page-header" />
