document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateReportBtn');
    const messageDiv = document.getElementById('message');

    generateBtn.addEventListener('click', async () => {
        generateBtn.disabled = true;
        messageDiv.textContent = 'Generating detailed report... Please wait.';
        messageDiv.style.color = 'inherit';

        try {
            const response = await fetch('/api/reports/detailed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate report');
            }

            const data = await response.json();
            
            // Create download link
            const link = document.createElement('a');
            link.href = data.filePath;
            link.download = data.fileName || data.filePath.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            messageDiv.innerHTML = `
                <span style="color: green;">Report generated successfully!</span><br>
                If the download didn't start automatically, <a href="${data.filePath}" download>click here to download</a>.
            `;
        } catch (error) {
            console.error('Error generating report:', error);
            messageDiv.innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
        } finally {
            generateBtn.disabled = false;
        }
    });
});