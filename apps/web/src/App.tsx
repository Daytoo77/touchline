import { useApp } from './store';
import { Home } from './screens/Home';
import { ClubPicker } from './screens/ClubPicker';
import { Setup } from './screens/Setup';
import { OnlineLobby } from './screens/OnlineLobby';
import { MatchScreen } from './screens/MatchScreen';
import { FullTime } from './screens/FullTime';
import { Toasts } from './components/Toasts';

export function App() {
  const screen = useApp((s) => s.screen);
  return (
    <div className="app">
      {screen === 'home' && <Home />}
      {screen === 'pick' && <ClubPicker />}
      {screen === 'setup' && <Setup />}
      {screen === 'online' && <OnlineLobby />}
      {screen === 'match' && <MatchScreen />}
      {screen === 'fulltime' && <FullTime />}
      <Toasts />
    </div>
  );
}
