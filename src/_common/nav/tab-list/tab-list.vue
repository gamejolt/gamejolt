<template>
	<div>
		<nav class="tab-list" :class="{ 'tab-list-centered': center }">
			<div class="tab-list-content">
				<div class="clearfix">
					<slot />

					<div class="tab-list-addons">
						<div class="tab-list-meta" v-if="!Screen.isMobile">
							<slot name="meta" />
						</div>

						<div class="tab-list-input" v-if="!Screen.isMobile">
							<slot name="input" />
						</div>

						<div class="tab-list-controls" v-if="!Screen.isMobile">
							<slot name="controls" />
						</div>
					</div>
				</div>
			</div>
		</nav>

		<div class="tab-list-input" v-if="Screen.isMobile">
			<slot name="input" />
		</div>

		<div class="tab-list-meta" v-if="Screen.isMobile">
			<slot name="meta" />
		</div>
	</div>
</template>

<style lang="stylus" src="./tab-list.styl"></style>

<script lang="ts" src="./tab-list"></script>
