import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  TextBox, Button, Icon, ProgressRing,
} from 'react-uwp';
import { Theme as UWPThemeProvider, getTheme } from 'react-uwp/Theme';
import isIP from 'validator/lib/isIP';
import isPort from 'validator/lib/isPort';
import './index.css';

const { ipcRenderer } = require('electron');

const App = () => {
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [ip, setIp] = useState('');
  const [port, setPort] = useState(6000);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    ipcRenderer.on('uhfConnected', () => {
      setIsConnected(true);
      setLoading(false);
    });

    ipcRenderer.on('uhfTimeout', () => {
      setLoading(false);
      setIsConnected(false);
      // eslint-disable-next-line no-alert
      alert('Connection timeout error. Please check your input!');
    });

    return () => {
      ipcRenderer.removeAllListeners();
    };
  }, []);

  const handleClick = () => {
    const localErrors = [];
    if (!isIP(ip, '4')) {
      localErrors.push('IP not valid');
    }
    if (!isPort(port.toString())) {
      localErrors.push('Port number not valid');
    }

    setErrors(localErrors);
    if (!localErrors.length) {
      ipcRenderer.send('connectRequest', ip, port);
      setLoading(true);
    }
  };

  return (
    <UWPThemeProvider
      theme={getTheme({
        themeName: 'light',
      })}
    >
      <div className="container" key="container">
        <div className="logo" key="logoContainer">
          <img width="30%" src="images/IUT.jpg" alt="IUT" />
        </div>
        <div className="form" key="form">
          <h2>
            IUT UHF Reader
          </h2>

          <TextBox
            placeholder="IP address"
            onChangeValue={(value) => setIp(value)}
          />

          <TextBox
            placeholder="Port number"
            onChangeValue={(value) => setPort(value)}
          />
          {!loading && (
          <Button
            background
            onClick={handleClick}
            disabled={isConnected}
            tooltip={isConnected && 'Connected'}
          >
            {!isConnected && 'Connect'}
            {isConnected && <Icon size={25}>CheckMarkLegacy</Icon>}
          </Button>
          )}
          {loading && <ProgressRing size={40} />}
          {errors.map((e) => (<p className="errorMessage">{e}</p>))}
        </div>

      </div>
    </UWPThemeProvider>

  );
};

ReactDOM.render(<App />, document.getElementById('root'));

export default App;
