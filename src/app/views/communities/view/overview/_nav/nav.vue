<template>
	<nav>
		<!-- There should always be an active item -->
		<template v-if="Screen.isMobile && activeItem">
			<div class="-item active" @click="isNavExpanded = !isNavExpanded">
				<span class="-menu-icon">
					<app-jolticon icon="menu" class="-jolticon middle" />
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
			<ol v-for="(group, i) of groups" :key="i">
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
						<span class="-label" :class="{ '-label-unread': isChannelUnread(item.channel) }">
							{{ item.label }}
						</span>
					</router-link>
				</li>
			</ol>
		</div>
	</nav>
</template>

<style lang="stylus" src="./nav.styl" scoped></style>

<script lang="ts" src="./nav"></script>
