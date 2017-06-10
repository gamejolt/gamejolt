import Vue from 'vue';
import VueRouter from 'vue-router';
import gui from 'nw.gui';
import { Component } from 'vue-property-decorator';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { ClientControl } from '../control/client.service';
import { State, Action } from 'vuex-class';
import { Store } from '../../../store/index';
import { UserTokenModal } from '../../user/token-modal/token-modal.service';

const packagePrefix = GJ_BUILD_TYPE === 'production' ? '/package' : '';

let tray: gui.Tray | undefined;

@Component({})
export class AppClientTray extends Vue
{
	@State app: Store['app'];
	@Action logout: Store['logout'];

	/**
	 * Whether or not the app will actually quit when you tell it to or if it
	 * will do a soft quit.
	 */
	isClientGreedy = true;

	section = 'main';
	isFocused = false;
	isMinimized = false;
	isClosed = false;

	created()
	{
		if ( /^\/auth\.html/.test( window.location.pathname ) ) {
			this.section = 'auth';
		}

		if ( this.section === 'auth' ) {
			this.isClientGreedy = true;
		}

		const win = gui.Window.get();

		win.on( 'blur', () => this.isFocused = false );
		win.on( 'focus', () => this.isFocused = true );
		win.on( 'minimize', () => this.isMinimized = true );
		win.on( 'restore', () => this.isMinimized = false );

		win.on( 'close', () =>
		{
			// If we should just minimize to tray instead of quitting.
			if ( this.isClientGreedy ) {
				this.isClosed = true;
				this.isMinimized = false;
				win.hide();
			}
			// Otherwise actually quit.
			else {
				ClientControl.quit();
			}
		} );
	}

	private toggleVisibility()
	{
		const win = gui.Window.get();

		if ( this.isClosed || this.isMinimized || !this.isFocused ) {
			ClientControl.show();
			this.isClosed = false;
		}
		// If the window is being shown and is focused, let's minimize it.
		else {
			win.minimize();
		}
	}

	private go( location: VueRouter.Location )
	{
		this.$router.push( location );
		ClientControl.show();
	}

	render( h: Vue.CreateElement )
	{
		// Changes to these will refresh the render function.
		const section = this.section;

		if ( tray ) {
			tray.remove();
			tray = undefined;
		}

		tray = new gui.Tray( {
			title: 'Game Jolt Client',

			// We split this up so that it doesn't get injected.
			// It needs to stay as a relative file path or it will break.
			icon: packagePrefix + '/app/components/client/tray/' + (Screen.isHiDpi ? 'icon-2x.png' : 'icon.png'),
			// TODO: Click doesn't exist?
			// it does exist, just not typed for some reason
			click: () => this.toggleVisibility(),
		} as any );

		const menu = new gui.Menu();

		if ( section !== 'auth' ) {
			menu.append( new gui.MenuItem( {
				label: this.$gettext( 'Browse Games' ),
				click: () => this.go( {
					name: 'discover.games.list._fetch',
					params: { section: 'featured' }
				} ),
			} ) );

			menu.append( new gui.MenuItem( { type: 'separator' } ) );

			menu.append( new gui.MenuItem( {
				label: 'Game Library',
				click: () =>
				{
					this.go( { name: 'library.installed' } );
					ClientControl.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Dashboard',
				click: () =>
				{
					this.go( { name: 'dashboard.main.overview' } );
					ClientControl.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Edit Account',
				click: () =>
				{
					this.go( { name: 'dashboard.account.edit' } );
					ClientControl.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Your Profile',
				click: () =>
				{
					this.go( { name: 'profile.overview', params: { username: this.app.user.username } } );
					ClientControl.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Your Game Token',
				click: () =>
				{
					UserTokenModal.show();
					ClientControl.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Settings',
				click: () =>
				{
					this.go( { name: 'settings' } );
					ClientControl.show();
				}
			} ) );

			menu.append( new gui.MenuItem( { type: 'separator' } ) );

			menu.append( new gui.MenuItem( {
				label: 'Logout',
				click: () =>
				{
					this.logout();
					ClientControl.show();
				},
			} ) );
		}

		// TODO
		// menu.append( new gui.MenuItem( {
		// 	label: 'Quit',
		// 	click: () =>
		// 	{
		// 		ClientControl.quit();
		// 	},
		// } ) );

		tray.menu = menu;

		return h( 'div' );
	}
}
