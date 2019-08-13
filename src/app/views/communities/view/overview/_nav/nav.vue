<template>
	<nav>
		<!-- There should always be an active item -->
		<template v-if="Screen.isMobile && activeItem">
			<div class="-item active" @click="isNavExpanded = !isNavExpanded">
				<span class="-menu-icon">
					<app-jolticon icon="menu" class="-jolticon middle" />
				</span>
				<span class="-icon" v-if="activeItem.type === 'tag'">
					<app-jolticon icon="tag" class="middle" />
				</span>
				<span class="-label">
					{{ activeItem.label }}
				</span>
			</div>
		</template>

		<div
			v-if="!Screen.isMobile || isNavExpanded"
			:class="{
				'-mobile-nav-container fill-darker anim-fade-in-up': Screen.isMobile,
			}"
		>
			<ol v-for="group of groups">
				<li v-for="item of group.items" :key="item.channel">
					<router-link
						class="-item"
						:class="{ active: item === activeItem && !isEditing }"
						:to="{
							name: 'communities.view.overview',
							params: {
								channel: item.routeParam,
							},
						}"
						block
						@click.native="isNavExpanded = false"
					>
						<span class="-icon" v-if="item.type === 'tag'">
							<app-jolticon icon="tag" class="middle" />
						</span>
						<span class="-label">
							{{ item.label }}
						</span>
					</router-link>
				</li>
			</ol>

			<app-community-perms
				:community="community"
				tag="ol"
				required="community-tags,community-media"
				either
			>
				<li>
					<router-link
						class="-item"
						:class="{ active: isEditing }"
						:to="{
							name: 'communities.view.overview.edit',
							params: {
								id: community.id,
							},
						}"
						block
					>
						<span class="-icon">
							<app-jolticon icon="edit" class="middle" />
						</span>
						<span class="-label">
							<translate>Edit</translate>
							<span v-if="!isEditing" class="-label-help help-inline">
								<translate>Only you can see this</translate>
							</span>
						</span>
					</router-link>
				</li>
			</app-community-perms>
		</div>
	</nav>
</template>

<style lang="stylus" src="./nav.styl" scoped></style>

<script lang="ts" src="./nav"></script>
