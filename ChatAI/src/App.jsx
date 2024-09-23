import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';


function App() {
  const [count, setCount] = useState(0)

  async function generateAnswer(){
    console.log("loaidng");
    const response=await axios({
      link:"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDERfqLZCOMtT_AOfq6ZPPNj5eJ0sAzdj8",
      method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });
    console.log(response);
  }

  return (
    <>
      <div>
        <h1>ChatAI Application</h1>
        <button onClick={generateAnswer}>Generate Answer</button>
      </div>
      
    </>
  )
}

export default App
