import { useRef, useState, useEffect } from 'react'
import './App.css'
import { uploadFile } from './service/api'

function App() {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [path, setPath] = useState(null)

  const handle = () => {
    fileInputRef.current.click()
  }
  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }
  useEffect(() => {
    const getImage = async () => {
      if (file) {
        const data = new FormData();  // FormData is used to send the file to the server by default,
        data.append('name', file.name);
        data.append('file', file);
        const response = await uploadFile(data);
        setPath(response.path);
      }
    }
    getImage();
  }, [file])

  return (
    <>
      <div className="main-wrapper" style={{ backgroundImage: `url('https://static.vecteezy.com/system/resources/previews/032/840/661/non_2x/a-futuristic-cityscape-with-lights-and-a-city-skyline-ai-generative-free-photo.jpeg')` }}>
        <div className="container">
          <div className="wrapper">
            <h1>Harsha's File Sharing</h1>
            <p>Upload and Share Files!</p>
            <button onClick={() => handle()}>Upload</button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            <a href={path} target="_blank">Download Here!</a>            {/* {path} is the path of the file that is uploaded to the server */}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
