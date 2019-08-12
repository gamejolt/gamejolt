<template>
	<app-theme :theme="community.theme">
		<router-link
			:to="{
				name: 'communities.view.overview',
				params: { path: community.path },
			}"
		>
			<div class="-community-container fill-darkest">
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
						<div class="-name">
							{{ community.name }}
						</div>
						<div v-if="community.member_count > 0" class="-member-count">
							<translate
								:translate-n="community.member_count || 0"
								:translate-params="{ count: number(community.member_count || 0) }"
								translate-plural="%{ count } Members"
							>
								%{ count } Member
							</translate>
						</div>
					</div>
				</div>
			</div>
		</router-link>
	</app-theme>
</template>

<style lang="stylus" scoped src="./community-badge.styl"></style>
<script lang="ts" src="./community-badge"></script>
