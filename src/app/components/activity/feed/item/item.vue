<script lang="ts" src="./item"></script>

<template>
	<app-scroll-inview
		:config="InviewConfig"
		@inview="onInviewChange(true)"
		@outview="onInviewChange(false)"
	>
		<app-scroll-inview
			:config="InviewConfigHydration"
			@inview="onInviewHydrationChange(true)"
			@outview="onInviewHydrationChange(false)"
		>
			<app-activity-feed-item-placeholder
				v-if="item.type !== 'notification' && !isBootstrapped"
			/>
			<template v-else>
				<!--
				Notifications are so small that there's no reason to not include them
				into the view.
				-->
				<app-activity-feed-event-item
					v-if="item.type === 'event-item'"
					:item="item"
					@resize="onResize"
				/>
				<app-activity-feed-notification
					v-else-if="item.type === 'notification'"
					:item="item"
				/>
			</template>
		</app-scroll-inview>
	</app-scroll-inview>
</template>
