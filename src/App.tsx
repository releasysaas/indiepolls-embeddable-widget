import './App.css';
import './widget/styles/style.css';

import { WidgetContainer } from './widget/components/widget-container.tsx';

function App() {
  return (
    <>
      <WidgetContainer
        clientKey={'019483fc-b33e-7456-a5df-5bfa9ede6429'}
        className='dark'
      />
    </>
  );
}

export default App;
