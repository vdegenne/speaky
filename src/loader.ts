// This needs to be before anything else
// because it sets a shared stylesheet used by
// elements' construtor.
import './styles/shared.js';

import '@material/web/all.js';

import './app-shell/app-shell.js';
/** or Firebase */
// import './firebase/onAuthStateChanged.js';

import './global-listeners.js';
