<script lang="ts" src="./client"></script>

<template>
	<div class="route-landing-client">
		<div class="alert alert-notice alert-well sans-margin">
			<div class="container text-center">
				<p>
					This is a
					<strong>pre-release</strong>
					. The Client isn't yet finished. Constructive feedback and ideas are welcome to
					help shape the best experience ever.
				</p>
			</div>
		</div>

		<section class="section landing-header text-center">
			<div class="container">
				<div class="row">
					<div class="col-lg-6 col-centered">
						<h1>
							<app-theme-svg class="bolt" src="~img/jolt.svg" alt="" strict-colors />
							Client
							<sup>PREVIEW</sup>
						</h1>
						<p>
							Effortlessly install too many games (and counting!), keep them updated
							automatically, and use the whole site without opening a browser.
						</p>
					</div>
				</div>
				<br />

				<div class="row">
					<div class="col-lg-6 col-centered">
						<div>
							<template v-if="isDetectedPlatformIncompatible">
								<p v-if="platform === 'other'">
									We could not detect what platform you are on.
									<br />
									Download the correct version below:
								</p>
								<template v-else>
									<p>
										We detected you are running on
										<strong>{{ detectedPlatformDisplay }} {{ arch }}bit</strong>
										<br />
										Oof! looks like the client is incompatible with it.
									</p>

									<p>Did we get it wrong? Download the correct version below:</p>
								</template>
							</template>
						</div>

						<br />
					</div>
				</div>

				<div class="row">
					<div class="header-download-buttons">
						<app-button
							v-if="shouldOfferWindows"
							v-app-track-event="`client-landing:download:win`"
							primary
							lg
							@click="download(platform, '32')"
						>
							<app-jolticon icon="download" />
							Download for Windows
						</app-button>

						<app-button
							v-if="shouldOfferMac"
							v-app-track-event="`client-landing:download:mac`"
							primary
							lg
							@click="download(platform, '64')"
						>
							<app-jolticon icon="download" />
							Download for OS X
						</app-button>

						<app-button
							v-if="shouldOfferLinux"
							v-app-track-event="`client-landing:download:linux`"
							primary
							lg
							@click="download(platform, arch)"
						>
							<app-jolticon icon="download" />
							Download for Linux 64bit
						</app-button>
					</div>
				</div>

				<!--
					If we did detect a valid platform, we offer only the matching version
					in the header. In case we got it wrong, we want to offer alternatives.
				-->
				<div v-if="!isDetectedPlatformIncompatible">
					<br />
					or download for
					<a v-app-scroll-to href="#all-downloads">other platforms</a>
					<br />
					<br />
					<app-jolticon icon="windows" class="text-muted" />
					<app-jolticon icon="mac" class="text-muted" />
					<app-jolticon icon="linux" class="text-muted" />
				</div>
			</div>
		</section>

		<div class="fill-darker">
			<section class="client-presentation">
				<div v-if="showMascot" class="container">
					<img
						class="client-presentation-mascot"
						src="./clyde-video-overlay.png"
						width="178"
						height="130"
						alt="Clyde Slicker"
					/>
				</div>
				<div class="client-presentation-inner">
					<div class="container text-center">
						<img
							class="img-responsive"
							src="./client-presentation.jpg"
							alt="Game Jolt Client"
						/>
					</div>
				</div>
			</section>

			<section class="features-stripe">
				<div class="container text-center">
					<div class="row">
						<div class="features-stripe-col col-sm-3 col-lg-2 col-lg-offset-2">
							<p><app-jolticon icon="game" class="jolticon-4x" /></p>
							<h5><strong>One Click Play</strong></h5>
							<p class="small">
								No more dealing with zip or (
								<em>shudder</em>
								) rar files! Click to install, click Launch to play.
							</p>
						</div>
						<div class="features-stripe-col col-sm-3 col-lg-2">
							<p><app-jolticon icon="download-box" class="jolticon-4x" /></p>
							<h5><strong>Auto Updates</strong></h5>
							<p class="small">
								Client keeps your installed games up-to-date with the latest
								versions.
							</p>
						</div>
						<div class="features-stripe-col col-sm-3 col-lg-2">
							<p><app-jolticon icon="offline" class="jolticon-4x" /></p>
							<h5><strong>Offline Mode</strong></h5>
							<p class="small">
								Play your installed games even when you're not online. Even on the
								toilet!
							</p>
						</div>
						<div class="features-stripe-col col-sm-3 col-lg-2">
							<p><app-jolticon icon="html5" class="jolticon-4x" /></p>
							<h5><strong>HTML Support</strong></h5>
							<p class="small">Play HTML and WebGL games in the Client.</p>
						</div>
					</div>
				</div>
			</section>

			<div class="highlight-rows">
				<section class="section">
					<div class="container">
						<div class="row">
							<div class="col-sm-6">
								<h2 class="section-header">
									<app-jolticon icon="game" class="jolticon-2x" />
									One Click Play
								</h2>
								<p>
									Client is the easiest, speediest way to install and play Game
									Jolt games. Click "Install" and Client will download and unpack
									the right files for your OS. Then click "Launch" to play, simple
									as that. So try out a bunch of games,
									<em>fast</em>
									.
								</p>
							</div>
							<div class="col-sm-6">
								<img
									class="img-responsive"
									src="./install-shot.jpg"
									alt="Install Fast"
								/>
							</div>
						</div>
					</div>
				</section>

				<section class="section">
					<div class="container">
						<div class="row">
							<div class="col-sm-6 col-sm-push-6">
								<h2 class="section-header">
									<app-jolticon icon="download-box" class="jolticon-2x" />
									Auto Updates
								</h2>
								<p>Never miss a release!</p>
								<p>
									Client keeps your installed games up to date, so you'll always
									play the latest versions. Your game library syncs up with your
									Game Jolt account, so you can access your playlists and receive
									notifications, as well.
								</p>
								<p>
									Even the Client itself auto-updates, so you'll always be
									browsing your favorite site using the latest version.
								</p>
							</div>
							<div class="col-sm-6 col-sm-pull-6">
								<img
									class="img-responsive"
									src="./auto-update-shot.jpg"
									alt="Auto Update"
								/>
							</div>
						</div>
					</div>
				</section>

				<section class="section">
					<div class="container">
						<div class="row">
							<div class="col-sm-6">
								<h2 class="section-header">
									<app-jolticon icon="users" class="jolticon-2x" />
									Chat Integration
								</h2>
								<p>Chat with the Game Jolt community using Client!</p>
								<p>
									Never miss a message again. Get notifications when friends
									message you. No more excuses.
								</p>
							</div>
							<div class="col-sm-6">
								<img class="img-responsive" src="./chat-shot.jpg" alt="Chat" />
							</div>
						</div>
					</div>
				</section>

				<section class="section">
					<div class="container">
						<div class="row">
							<div class="col-sm-6 col-sm-push-6">
								<h2 class="section-header">
									<app-jolticon icon="offline" class="jolticon-2x" />
									Offline Mode
								</h2>
								<p>
									Play your installed games any time, even when you're not online.
								</p>
								<p>
									Neither power outage nor shoddy wifi will stand in the way of
									your gaming! Client will sync your library and update your games
									the next time you connect.
								</p>
							</div>
							<div class="col-sm-6 col-sm-pull-6">
								<img
									class="img-responsive"
									src="./offline-mode-shot.jpg"
									alt="Offline Mode"
								/>
							</div>
						</div>
					</div>
				</section>

				<section class="section">
					<div class="container">
						<div class="row">
							<div class="col-sm-6">
								<h2 class="section-header">
									<app-jolticon icon="html5" class="jolticon-2x" />
									HTML Support
								</h2>
								<p>
									Quick play HTML (and WebGL) games without ever needing to open a
									browser window. You'll almost never have to leave the comfort of
									Client!
								</p>
							</div>
							<div class="col-sm-6">
								<img
									class="img-responsive"
									src="./html-games-shot.jpg"
									alt="HTML Games"
								/>
							</div>
						</div>
					</div>
				</section>

				<section class="section">
					<div class="container">
						<div class="row">
							<div class="col-sm-6 col-sm-push-6">
								<h2 class="section-header">
									<app-jolticon icon="world" class="jolticon-2x" />
									Open Source
								</h2>
								<p>
									Wanna know what we're putting on your desktop? Client is fully
									open source!
								</p>
								<p>
									You can view us working on the project, pull it and make changes
									for the fun of it, release customized versions of the client, or
									even help fix bugs at the
									<app-link-external href="https://github.com/gamejolt/gamejolt">
										GitHub repository
									</app-link-external>
									.
								</p>
							</div>
							<div class="col-sm-6 col-sm-pull-6">
								<img
									class="img-responsive"
									src="./open-source-shot.jpg"
									alt="Open Source"
								/>
							</div>
						</div>
					</div>
				</section>

				<section class="section">
					<div class="container">
						<div class="row">
							<div class="col-sm-6">
								<h2 class="section-header">
									<app-jolticon icon="gamejolt" class="jolticon-2x" />
									Access All of Game Jolt
								</h2>
								<p>
									Client is not just a downloader app; it's the
									<strong>whole Game Jolt site on your desktop.</strong>
									Browse, search, and find games. Chat with friends and receive
									notifications. Even upload files, manage games, and edit pages
									right in Client.
								</p>
								<p>It's pretty much all you've ever dreamed of, most likely.</p>
							</div>
							<div class="col-sm-6">
								<img
									class="img-responsive"
									src="./full-site-shot.jpg"
									alt="Game Jolt"
								/>
							</div>
						</div>
					</div>
				</section>
			</div>

			<section id="all-downloads" class="download-footer">
				<div class="container text-center">
					<div class="row">
						<div class="col-lg-9 col-centered">
							<div class="row">
								<div class="download-footer-col col-sm-4">
									<p><app-jolticon icon="linux" class="jolticon-4x" /></p>
									<p>
										<app-button
											v-app-track-event="`client-landing:download:linux`"
											primary
											block
											@click="download('linux', '64')"
										>
											<app-jolticon icon="download" />
											Download Linux 64bit
										</app-button>
									</p>
								</div>
								<div class="download-footer-col col-sm-4">
									<p><app-jolticon icon="mac" class="jolticon-4x" /></p>
									<p>
										<app-button
											v-app-track-event="`client-landing:download:mac`"
											primary
											block
											@click="download('mac', '64')"
										>
											<app-jolticon icon="download" />
											Download Mac
										</app-button>
									</p>
								</div>
								<div class="download-footer-col col-sm-4">
									<p><app-jolticon icon="windows" class="jolticon-4x" /></p>
									<p>
										<app-button
											v-app-track-event="`client-landing:download:win`"
											primary
											block
											@click="download('windows', '32')"
										>
											<app-jolticon icon="download" />
											Download Windows
										</app-button>
									</p>
								</div>
							</div>
						</div>
					</div>
					<br />

					<p class="lead">Play games. Make games.</p>
				</div>
			</section>

			<section class="section fill-dark">
				<div class="container text-center">
					<div class="row">
						<p class="sans-margin">
							<strong>Found a bug?</strong>
							Post it in the
							<app-link-external
								href="https://github.com/gamejolt/issue-tracker/issues"
							>
								issue tracker
							</app-link-external>
							.
						</p>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<style lang="stylus" src="./client.styl" scoped></style>
