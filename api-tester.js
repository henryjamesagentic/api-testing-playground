document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}-content`) {
          content.classList.add('active');
        }
      });
    });
  });
  
  // Send request functionality
  const sendBtn = document.getElementById('sendRequest');
  const methodSelect = document.getElementById('method');
  const urlInput = document.getElementById('url');
  const paramsInput = document.getElementById('params');
  const headersInput = document.getElementById('headers');
  const bodyInput = document.getElementById('body');
  const authInput = document.getElementById('auth');
  const statusCode = document.getElementById('statusCode');
  const responseTime = document.getElementById('responseTime');
  const responseSize = document.getElementById('responseSize');
  const responseOutput = document.getElementById('responseOutput');
  
  sendBtn.addEventListener('click', async function() {
    const method = methodSelect.value;
    let url = urlInput.value.trim();
    
    if (!url) {
      alert('Please enter a URL');
      return;
    }
    
    // Add query params if GET and params provided
    if (method === 'GET') {
      try {
        const params = JSON.parse(paramsInput.value || '{}');
        const queryParams = new URLSearchParams(params).toString();
        if (queryParams) {
          url += (url.includes('?') ? '&' : '?') + queryParams;
        }
      } catch (e) {
        // Ignore parse errors for params
      }
    }
    
    // Prepare request options
    const options = {
      method: method,
      headers: {}
    };
    
    // Add headers
    try {
      const headers = JSON.parse(headersInput.value || '{}');
      Object.entries(headers).forEach(([key, value]) => {
        options.headers[key] = value;
      });
    } catch (e) {
      // Ignore parse errors for headers
    }
    
    // Add authorization
    const auth = authInput.value.trim();
    if (auth) {
      if (auth.startsWith('Bearer ')) {
        options.headers['Authorization'] = auth;
      } else if (auth.startsWith('Basic ')) {
        options.headers['Authorization'] = auth;
      } else {
        options.headers['Authorization'] = `Bearer ${auth}`;
      }
    }
    
    // Add body for non-GET requests
    if (method !== 'GET') {
      try {
        const body = bodyInput.value.trim();
        if (body) {
          options.body = body;
          if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
          }
        }
      } catch (e) {
        // Ignore parse errors for body
      }
    }
    
    // Show loading
    responseOutput.textContent = 'Sending request...';
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, options);
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      
      const responseText = await response.text();
      const size = new Blob([responseText]).size;
      
      // Update response info
      statusCode.textContent = response.status;
      statusCode.style.color = response.ok ? '#4CAF50' : '#f44336';
      responseTime.textContent = timeTaken;
      responseSize.textContent = size;
      
      // Format JSON response if possible
      try {
        const json = JSON.parse(responseText);
        responseOutput.textContent = JSON.stringify(json, null, 2);
      } catch {
        responseOutput.textContent = responseText;
      }
      
    } catch (error) {
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      
      statusCode.textContent = 'Error';
      statusCode.style.color = '#f44336';
      responseTime.textContent = timeTaken;
      responseSize.textContent = '--';
      responseOutput.textContent = `Error: ${error.message}`;
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
    }
  });
  
  // Example request button
  const exampleBtn = document.createElement('button');
  exampleBtn.textContent = 'Load Example';
  exampleBtn.className = 'send-btn';
  exampleBtn.style.marginLeft = '10px';
  exampleBtn.addEventListener('click', function() {
    urlInput.value = 'https://jsonplaceholder.typicode.com/posts';
    methodSelect.value = 'POST';
    bodyInput.value = JSON.stringify({
      title: 'API Test from Playground',
      body: 'This is a test request from the API Testing Playground',
      userId: 1
    }, null, 2);
    headersInput.value = JSON.stringify({
      'Content-Type': 'application/json'
    }, null, 2);
  });
  
  document.querySelector('.method-selector').appendChild(exampleBtn);
});