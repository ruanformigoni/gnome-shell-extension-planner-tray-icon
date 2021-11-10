const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const Util = imports.misc.util;

const timeout = 5;

let cmd_geary_run = "flatpak run org.gnome.Geary";
let cmd_geary_is_inactive = "pgrep geary";

function _showGeary() {
  Util.spawnCommandLine(cmd_geary_run)
}

const Indicator = new Lang.Class({
  Name: 'Geary Indicator',
  Extends: PanelMenu.Button,
  icon: new St.Icon({ style_class: 'geary-on-icon' }),

  _init: function() {
    // Init super
    this.parent(0.0, "Geary Indicator", false);

    // Set timeout
    this.timeout_seconds = timeout;

    // Include child
    this.add_child(this.icon);

    // Connect event
    this.connect('button-press-event', _showGeary);

    // Refresh
    this._refresh();
  },

  _refresh: function () {
    // Spawn cmd to check if geary is active
    let [,,,code] = GLib.spawn_command_line_sync(cmd_geary_is_inactive)

    // Update icon based on status code
    if ( code == 0) {
      this.icon = new St.Icon({ style_class: 'geary-on-icon' });
    }
    else {
      this.icon = new St.Icon({ style_class: 'geary-off-icon' });
    }

    // Update child
    this.destroy_all_children();
    this.add_child(this.icon);

    // Handle timeout
    if (this._timeout) {
      Mainloop.source_remove(this._timeout);
      this._timeout = null;
    }

    this._timeout = Mainloop.timeout_add_seconds(this.timeout_seconds
      , Lang.bind(this, this._refresh)
    );

    return true;
  },

});

let menu;

function init() {}

function enable() {
  menu = new Indicator();
  Main.panel.addToStatusArea('indicator', menu);
}

function disable() {
  menu.destroy();
}
