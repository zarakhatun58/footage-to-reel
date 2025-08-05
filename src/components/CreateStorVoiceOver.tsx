import React, { useState } from 'react';

const CreateStorVoiceOver = () => {
  const [showAudioOptions, setShowAudioOptions] = useState(false);
  const [manualOptions, setManualOptions] = useState(false);
  const [selectedAudioMode, setSelectedAudioMode] = useState('original'); // 'original', 'silent', 'custom'

  const toggleAudioOptions = () => {
    setShowAudioOptions(!showAudioOptions);
  };
  const toggleManualOptions = () => {
    setManualOptions(!manualOptions);
  };

  const handleAudioModeChange = (mode:any) => {
    setSelectedAudioMode(mode);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto my-8">
      {/* Header and Toggle Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          <i className="fas fa-music mr-2"></i>Audio Settings
        </h2>
        <button
          onClick={toggleAudioOptions}
          className="px-4 py-2 rounded-md font-medium text-white transition-colors duration-200"
          style={{ backgroundColor: '#FF8C00' }} // Orange color from the image
        >
          {showAudioOptions ? 'Hide Audio Options' : 'Show Audio Options'}
        </button>
         <button
          onClick={toggleManualOptions}
          className="px-4 py-2 rounded-md font-medium text-white transition-colors duration-200"
          style={{ backgroundColor: '#FF8C00' }} // Orange color from the image
        >
          {manualOptions ? 'Auto Select' : 'Manual select'}
        </button>
      </div>

      {/* Audio Options Section - Conditionally rendered */}
      {showAudioOptions && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 transition-all duration-300 ease-in-out">
          <p className="text-gray-700 mb-4">Choose how to handle audio in your generated story</p>

          <div className="space-y-3">
            {/* Keep Original Audio */}
            <label className="flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-150">
              <input
                type="radio"
                name="audioMode"
                value="original"
                checked={selectedAudioMode === 'original'}
                onChange={() => handleAudioModeChange('original')}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-800 font-medium">Keep Original Audio</span>
              <p className="ml-2 text-gray-600 text-sm">Use the original audio from your video footage</p>
            </label>

            {/* Remove Audio (Silent Video) */}
            <label className="flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-150">
              <input
                type="radio"
                name="audioMode"
                value="silent"
                checked={selectedAudioMode === 'silent'}
                onChange={() => handleAudioModeChange('silent')}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-800 font-medium">Remove Audio (Silent Video)</span>
              <p className="ml-2 text-gray-600 text-sm">Create a silent video with no audio track</p>
            </label>

            {/* Replace with Custom Audio */}
            <label className="flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-150">
              <input
                type="radio"
                name="audioMode"
                value="custom"
                checked={selectedAudioMode === 'custom'}
                onChange={() => handleAudioModeChange('custom')}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-800 font-medium">Replace with Custom Audio</span>
              <p className="ml-2 text-gray-600 text-sm">Upload your own audio file to replace the original</p>
            </label>
          </div>
        </div>
      )}
      <textarea
        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Describe how to create a story from your selected scenes (e.g., 'Create an exciting montage from these scenes', 'Make an emotional story connecting these moments', 'Arrange these scenes chronologically')"
      // Add value and onChange props for controlled component in React
      ></textarea>
      <button className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700">
        GENERATE STORY
      </button>
    </div>
  );
};

export default CreateStorVoiceOver;