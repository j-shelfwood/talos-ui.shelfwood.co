// The design-system version this site renders: the exact pin in this app's
// package.json (the only manifest that declares it), read at build time so
// version labels on the site cannot drift from the installed package.
import pkg from "../package.json";

export const talosVersion: string = pkg.dependencies["@j_shelfwood/talos-ui"];
