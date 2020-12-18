import logo from './icon-logo.png';
import add from './icon-add.png';
import arrow from './icon-arrow.png';
import comment from './icon-comment.png';
import trash from './icon-trash.png';
import './App.scss';
import { useEffect, useState } from 'react';

const App = () => {

  const [documentData, setDocumentData] = useState(null);
  const [headerNav, setHeaderNav] = useState([]);
  const [commentButtons, setCommentButtons] = useState([]);
  const [activeDocument, setActiveDocument] = useState(1);
  const [activeComment, setActiveComment] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentIsActive, setCommentIsActive] = useState(false);

  const compileHeaderList = (data) => {
    setHeaderNav(data['hydra:member'].map((e) => {
      return(
      <li
        key={e.id}
        className={activeDocument === e.id ? 'active' : ''}
        onClick={() => {setActiveDocument(e.id)}}
      >
        {e.title}
      </li>
      )
    }));
  }

  const handleCommentButton = (id) => {
    getComment(id);
  }

  const compileCommentButtons = (data) => {
    setCommentButtons(data['hydra:member'].find((e) => {return (e.id === activeDocument)}).notes.map((e) => {
      return (
      <img
        key={e}
        src={comment}
        alt="comment icon"
        className="commentIcon"
        onClick={() => handleCommentButton(e)}
      />
      )
    }));
  }

  const resetCommentStates = () => {
    setActiveComment('');
    setActiveCommentId(null);
    setCommentIsActive(false);
  }

  const findActiveDocument = () => {
    return (
      documentData['hydra:member'].find((e) => {return (e.id === activeDocument)})
    );
  }


  const getDocuments = () => {
    fetch('http://api.edelmann.co.uk/api/documents')
      .then((resp) => { return resp.json() }) // Convert data to json
      .then((data) => {
        setDocumentData(data);
        compileHeaderList(data);
        compileCommentButtons(data);
      })
      .catch(function () {
        // catch any errors
      });
  }

  const getComment = (id) => {
    fetch('http://api.edelmann.co.uk'+id)
      .then((resp) => { return resp.json() }) // Convert data to json
      .then((data) => {
        setActiveCommentId(prevState => {
          if(prevState === null){
            setCommentIsActive(true);
            setActiveComment(data.content);
            return (id);
          }
          if(prevState === id){
            setCommentIsActive(false);
            setActiveComment ('');
            return(null);
          }
          setActiveComment (data.content);
          setCommentIsActive(true);
          return (id);
        });
      })
      .catch(function () {
        // catch any errors
      });
  }

  const createComment = () => {
    const dateNow = new Date();
    const bodyData = {
      "document": `/api/documents/${activeDocument}`,
      "content": "Skriv kommentar her...",
      "updatedAt": dateNow.toISOString(),
      "createdAt": dateNow.toISOString()
    }
    fetch('http://api.edelmann.co.uk/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData)
    })
    .then((resp) => { return resp.json() }) // Convert data to json
    .then((data) => {
      setCommentIsActive(true);
      setActiveCommentId(data.id);
      setActiveComment(data.content);
      const newCommentButtonsArr = commentButtons.concat(
        [
          <img
            key={data['@id']}
            src={comment}
            alt="comment icon"
            className="commentIcon"
            onClick={() => handleCommentButton(data['@id'])}
          />
        ]
      )
      setCommentButtons(newCommentButtonsArr);
    })
    .catch(function () {
      // catch any errors
    });
  }

  const updateComment = () => {
    const dateNow = new Date();
    const bodyData = {
      "document": `/api/documents/${activeDocument}`,
      "content": activeComment,
      "updatedAt": dateNow.toISOString(),
      "createdAt": dateNow.toISOString()
    }
    fetch('http://api.edelmann.co.uk'+activeCommentId, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify(bodyData)
    })
    .then((resp) => {
      getDocuments();
      resetCommentStates();
    })
    .catch(function () {
      // catch any errors
    });
  }

  const deleteComment = (id) => {
    fetch('http://api.edelmann.co.uk'+id, {method: 'DELETE'})
    .then((resp) => {
      getDocuments();
      resetCommentStates();
    })
    .catch(function () {
      // catch any errors
    });
  }

  useEffect(() => {
    getDocuments();
  }, []);

  useEffect(() => {
    if(documentData){
      compileHeaderList(documentData);
      compileCommentButtons(documentData);
    }
    resetCommentStates();
  }, [activeDocument]);

  return (
    <div className="App">
      <header className="header">
        <ul>
        {headerNav.length > 0 && headerNav}
        </ul>
        <img src={logo} alt="Logo icon" />
      </header>
      <main className="main">
        <h1>{documentData && findActiveDocument().title}</h1>
        <div className="documentContent">
          <div className="documentText">
            {documentData && <p> {findActiveDocument().content.replace(/ +(?= )/g,'')}</p>}
          </div>
          <div className="documentComment">
            <div className={`commentWrapper ${commentIsActive ? 'active' : ''}`}>
              <div className="commentContent">
                <textarea
                  id="commentInput"
                  name="commentInput"
                  rows="8"
                  value={activeComment}
                  onChange={(event) => {setActiveComment(event.target.value)}}
                />
                <div className="buttomCommentContent">
                  <button className="saveComment" onClick={() => updateComment()}>Gem</button>
                  <img src={trash} alt="trash icon" className="trashComment" onClick={() => deleteComment(activeCommentId)} />
                </div>
              </div>
              <div className="commentContainer">
                <img src={arrow} alt="arrow icon" className="arrow top" />
                {commentButtons}
                <img src={add} alt="add icon" className="addComment" onClick={() => createComment()} />
                <img src={arrow} alt="arrow icon" className="arrow bottom" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
