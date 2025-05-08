// js/router.js
import { AuthPage } from './auth.js';
import { ProfilePage } from './profile.js';

export function router(route) {
  switch (route) {
    case '#/login':
      return new AuthPage();
    case '#/profile':
      return new ProfilePage();
    default:
      return null;
  }
}
