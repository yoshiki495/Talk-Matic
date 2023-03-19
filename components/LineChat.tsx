import React, { useState, useEffect } from 'react'
import axios from 'axios'

const MicRecorder = require('mic-recorder-to-mp3');

const Mp3Recorder = new MicRecorder({ bitRate: 128 })

const AIChat: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [inputText, setInputText] = useState('')
  const [response, setResponse] = useState('')

  const startRecording = async () => {
    try {
      await Mp3Recorder.start()
      setIsRecording(true)
    } catch (e) {
      console.error(e)
    }
  }

  const stopRecording = async () => {
    try {
      const [buffer, blob] = await Mp3Recorder.stop().getMp3()
      setIsRecording(false)
      const formData = new FormData()
      formData.append('file', new File(buffer, 'speech.mp3', { type: 'audio/mpeg' }))

      const { data } = await axios.post('/api/whisper', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setInputText(data.transcript)
      getAIResponse(data.transcript)
    } catch (e) {
      console.error(e)
    }
  }

  const handleTextInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value)
  }

  const getAIResponse = async (text: string) => {
    try {
      const { data } = await axios.post('/api/chatgpt', { prompt: text })
      setResponse(data.text)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (response) {
      speak(response);
    }
  }, [response]);

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  const handleTextSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    getAIResponse(inputText)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-6">Talk Matic</h1>
            <div className="mb-6">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="bg-pink-500 text-white px-4 py-2 rounded shadow"
                >
                  Stop Recording
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="bg-indigo-500 text-white px-4 py-2 rounded shadow"
                >
                  Start Recording
                </button>
              )}
            </div>
            <form onSubmit={handleTextSubmit} className="mb-6">
              <input
                type="text"
                value={inputText}
                onChange={handleTextInput}
                className="border border-gray-300 p-2 w-full mb-4 rounded"
                placeholder="Type your message"
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded shadow"
              >
                Send
              </button>
            </form>
            <div>
              <p className="font-semibold">AI Response:</p>
              <p className="text-gray-600 mb-4">{response}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChat
