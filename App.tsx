import React, { useState, useCallback } from 'react';
import { generateSpeech } from './services/geminiService';
import { pcmToWavBlob, decode } from './utils/audioUtils';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
    const [text, setText] = useState<string>('Hello, this is a demonstration of the Gemini Text-to-Speech API. I am speaking with the voice of Fenrir.');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);

    const handleGenerateSpeech = useCallback(async () => {
        if (!text.trim()) {
            setError('Please enter some text to generate speech.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        if (audioURL) {
            URL.revokeObjectURL(audioURL);
            setAudioURL(null);
        }

        try {
            const base64Audio = await generateSpeech(text);
            if (!base64Audio) {
                throw new Error('Received empty audio data from the API.');
            }

            const pcmData = decode(base64Audio);
            // Gemini TTS provides 24kHz, 1-channel, 16-bit PCM audio
            const wavBlob = pcmToWavBlob(pcmData, 24000, 1, 16);
            const url = URL.createObjectURL(wavBlob);
            setAudioURL(url);

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate speech: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [text, audioURL]);

    return (
        <main className="bg-gradient-to-br from-gray-900 to-slate-800 min-h-screen w-full flex items-center justify-center p-4 font-sans text-white">
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                            Bill's Voice TTS
                        </h1>
                        <p className="text-slate-400 mt-2">Powered by Gemini 2.5 Flash</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex flex-col">
                            <label htmlFor="tts-input" className="mb-2 text-sm font-medium text-slate-300">
                                Enter your text
                            </label>
                            <textarea
                                id="tts-input"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type something here..."
                                className="w-full h-40 p-4 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none placeholder-slate-500"
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            onClick={handleGenerateSpeech}
                            disabled={isLoading || !text.trim()}
                            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transform hover:scale-105 active:scale-100 disabled:scale-100"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner />
                                    <span>Generating Audio...</span>
                                </>
                            ) : (
                                'Generate Speech'
                            )}
                        </button>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
                                <p>{error}</p>
                            </div>
                        )}

                        {audioURL && (
                            <div className="mt-6 flex flex-col items-center">
                                <h3 className="text-lg font-semibold mb-3">Generated Audio</h3>
                                <audio controls src={audioURL} className="w-full rounded-lg shadow-inner bg-slate-800">
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                    </div>
                </div>
                 <footer className="text-center mt-6 text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} AI Voice Generator. All rights reserved.</p>
                </footer>
            </div>
        </main>
    );
};

export default App;
