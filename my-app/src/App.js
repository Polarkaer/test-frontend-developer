import logo from './logo.svg';
import './App.scss';
import { useEffect } from 'react';

const App = () => {

  const getDocuments = () => {
    fetch('http://api.edelmann.co.uk/api/documents')
      .then((resp) => { return resp.json() }) // Convert data to json
      .then((data) => {
        console.log('data', data);
      })
      .catch(function () {
        // catch any errors
      });
  }

  useEffect(() => {
    getDocuments();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
