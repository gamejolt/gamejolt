<template>
	<app-popper hide-on-state-change @hide="resetSelections">
		<slot />

		<div slot="popover">
			<div class="-container">
				<div class="-slider" :class="{ '-slide-to-channels': !!selectedCommunity }">
					<div class="-communities list-group">
						<a
							class="-community-item list-group-item"
							v-for="community of communities"
							:key="community.id"
							@click="selectCommunity(community)"
						>
							<app-community-thumbnail-img
								slot="img"
								class="-community-img"
								:community="community"
							/>

							{{ community.name }}
							<app-community-verified-tick class="-tick" :community="community" small />
						</a>
					</div>

					<div class="-channels list-group">
						<template v-if="channels">
							<a
								class="-channel-item list-group-item"
								v-for="channel of channels"
								:key="channel.id"
								@click="selectChannel(channel)"
							>
								{{ channel.title }}
							</a>
						</template>
					</div>
				</div>
			</div>
		</div>
	</app-popper>
</template>

<style lang="stylus" src="./selector.styl" scoped></style>

<script lang="ts" src="./selector"></script>
