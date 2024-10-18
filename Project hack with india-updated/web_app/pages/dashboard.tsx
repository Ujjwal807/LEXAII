import React, { useState } from 'react';

const FileUpload: React.FC = () => {
  const [selectedResponse, setSelectedResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    if (!file) return;

    try {
      // Save the file to inputtext.txt via the backend
      const fileData = new Blob([await file.text()], { type: 'text/plain' });
      const formDataToSend = new FormData();
      formDataToSend.append('file', fileData, 'inputtext.txt');

      const response = await fetch('http://localhost:5001/save-file', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Error saving file');

      // Now start checking for the completion of the script
      const intervalId = setInterval(async () => {
        const outputResponse = await fetch('http://localhost:5001/check-output');
        const outputData = await outputResponse.json();

        if (outputData.isComplete) {
          setSelectedResponse(outputData.answer);
          const textarea = document.getElementById('response') as HTMLTextAreaElement;
          if (textarea) textarea.value = outputData.answer;
          clearInterval(intervalId);
        }
      }, 3000); // Check every 3 seconds
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='titre'>
        <div className='first-word'>Contract Q&A:</div> 
        <div className='complete-phrase'>
          <span>Unlocking Answers to Vital Questions</span>
        </div>
      </div>
      <div className='dashboard'>
        <form onSubmit={handleFormSubmit} encType="multipart/form-data">
          <label htmlFor="file" className="drop-container">
            <span className="drop-title">Drop files here</span>
            or
            <input type="file" className='file-upload' name="file" accept=".txt" required />
          </label>
          <div className="button-container">
            <input className="custom-btn btn-8" type="submit" value={isLoading ? "Processing..." : "Generate Response"} disabled={isLoading} />
          </div>
        </form>
        <div className="code-container">
          <section className="augs bg" data-augmented-ui>
            <input className="title" value="Get Response" readOnly />
            <div className="code highcontrast-dark">
              <textarea id="response" className="code-textarea" rows={10} placeholder="Generate Response..." readOnly></textarea>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default FileUpload;
