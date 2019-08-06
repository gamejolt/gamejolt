<template>
	<app-theme :theme="community.theme">
		<router-link
			:to="{
				name: 'communities.view.overview',
				params: { path: community.path },
			}"
		>
			<app-card class="-community-container">
				<div v-if="community.header" class="-header">
					<img :src="community.header.mediaserver_url" />
				</div>
				<div class="-content">
					<div class="-thumbnail">
						<img :src="community.img_thumbnail" />
					</div>
					<div>
						<div class="tag">
							<translate>Game Community</translate>
						</div>
						<div>
							<span class="-name">{{ community.name }}</span>
							<span v-if="community.member_count > 0" class="-member-count text-muted">
								<span class="dot-separator" />
								<translate
									:translate-n="community.member_count || 0"
									:translate-params="{ count: number(community.member_count || 0) }"
									translate-plural="%{ count } Members"
								>
									%{ count } Member
								</translate>
							</span>
						</div>
					</div>
				</div>
			</app-card>
		</router-link>
	</app-theme>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-community-container
	margin-bottom: $line-height-computed
	position: relative
	overflow: hidden

	@media $media-sm
		elevate-1()

	&:hover
		elevate-2()

.-header
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	z-index: 0

	img
		display: block
		width: 100%
		height: 100%

		mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0));

.-content
	position: relative
	z-index: 1
	display: flex
	align-items: center

.-name
	font-weight: bolder
	font-size: $font-size-h4

.-thumbnail
	width: 50px
	height: 50px
	background-color: var(--theme-white)
	border-radius: 50%
	padding: 2px
	margin-right: ($grid-gutter-width / 4)
	elevate-1()

	img
		display: block
		width: 100%
		height: 100%
		img-circle()

.-member-count
	font-size: $font-size-small

	.dot-separator
		change-bg('light')

</style>

<script lang="ts" src="./community"></script>
