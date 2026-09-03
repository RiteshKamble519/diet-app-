// Where the Bun backend lives. Change this to match how you're testing:
//
// - Physical phone via Expo Go: use your computer's LAN IP, e.g.
//   "http://192.168.1.42:8787" (find it with `ipconfig getifaddr en0` on
//   Mac, or `ipconfig` on Windows). "localhost" on a physical device means
//   the phone itself, not your dev machine.
// - Android emulator: "http://10.0.2.2:8787"
// - iOS simulator: "http://localhost:8787" works fine.
// - Deployed backend (e.g. Render): use its public https:// URL, and drop
//   the port.
export const API_BASE_URL = 'http://localhost:8787';
