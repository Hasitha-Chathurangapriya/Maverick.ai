// API Configuration for Chat
const encodedKey = 'c2stb3ItdjEtMGMyMGM5Zjc2NTg2YmNhYTAwN2NhMzVkNjZhYjRhMTNiOTc4ZTU1YzFlYmZiMDE4NGIzMmI1NzQwMjMzNjg5Yw==';
const API_KEY = atob(encodedKey);
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// API Configuration for GNews API
const GNEWS_API_KEY = 'bcfbeda1a0861dbf2f490a2e8ccf3353'; // Replace with your GNews API key
const GNEWS_API_URL = `https://gnews.io/api/v4/search?q=artificial%20intelligence&lang=en&sortby=publishedAt&max=5&apikey=${GNEWS_API_KEY}`;

// DOM Elements
const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.getElementById('chat-container');
const loader = document.getElementById('loader');
const optionButtons = document.querySelectorAll('.option-btn');
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');
const htmlRoot = document.getElementById('html-root');

// Theme Toggle
const toggleTheme = () => {
    const isDark = htmlRoot.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.innerHTML = isDark
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
};

// Load Theme Preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    htmlRoot.classList.add('dark');
    themeIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
}

themeBtn.addEventListener('click', toggleTheme);

// Mode Tracking
let currentMode = 'normal';
let newsPage = 1; // For pagination in AI News mode

// Loading Animation
window.onload = function() {
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 1s ease';
        setTimeout(() => {
            loader.style.display = 'none';
            chatContainer.style.display = 'block';
            chatContainer.style.opacity = '0';
            chatContainer.style.transition = 'opacity 1s ease';
            setTimeout(() => {
                chatContainer.style.opacity = '1';
            }, 50);
        }, 1000);
    }, 3000);
};

// Option Selection
optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        optionButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        chatDisplay.innerHTML = '';
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'message bot-message welcome-message';
        welcomeMsg.innerHTML = `<span class="welcome-text">Welcome to Maverick!</span><br>Your futuristic AI assistant is here to help. Choose an option above to dive in!`;
        chatDisplay.appendChild(welcomeMsg);

        // If AI News mode is selected, fetch initial news
        if (currentMode === 'ai-news') {
            newsPage = 1; // Reset page number
            fetchAINews();
        }
    });
});

// Function to Show Loading Message
function showLoadingMessage() {
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'loading-message';
    loadingMsg.innerHTML = '<div class="spinner"></div>Processing...';
    chatDisplay.appendChild(loadingMsg);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
    return loadingMsg;
}

// Function to Remove Loading Message
function removeLoadingMessage(loadingMsg) {
    if (loadingMsg && loadingMsg.parentNode) {
        loadingMsg.parentNode.removeChild(loadingMsg);
    }
}

// Send Message Function
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message user-message';
    userMsg.textContent = message;
    chatDisplay.appendChild(userMsg);

    // Clear input
    userInput.value = '';

    // Handle based on mode
    if (currentMode === 'normal') {
        fetchBotResponse(message);
    } else if (currentMode === 'jobs') {
        provideJobInfo(message);
    } else if (currentMode === 'coding') {
        handleCodingQuestion(message);
    } else if (currentMode === 'it') {
        handleITCalculation(message);
    } else if (currentMode === 'ai-news') {
        // In AI News mode, the input field is not used for queries
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        botMsg.innerHTML = "In **AI News** mode, I fetch the latest AI news for you. Use the 'Load More News' button to see more recent articles!";
        chatDisplay.appendChild(botMsg);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    // Scroll to bottom
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Normal Chat API Call
async function fetchBotResponse(message) {
    const loadingMsg = showLoadingMessage();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat:free',
                messages: [{ role: 'user', content: message }]
            })
        });

        removeLoadingMessage(loadingMsg);

        if (response.ok) {
            const data = await response.json();
            const botReply = data.choices[0].message.content;
            displayBotMessage(botReply);
        } else {
            throw new Error(`Status: ${response.status}`);
        }
    } catch (error) {
        removeLoadingMessage(loadingMsg);
        displayBotMessage(`Error: ${error.message}`);
    }
}

// Job Info Function
function provideJobInfo(message) {
    const jobKeywords = ['job', 'career', 'profession', 'role', 'qualifications', 'skills', 'education', 'salary', 'engineer', 'developer', 'accountant', 'teacher', 'doctor', 'nurse', 'manager'];
    const isJobRelated = jobKeywords.some(keyword => message.toLowerCase().includes(keyword));

    if (isJobRelated) {
        fetchBotResponse(`Provide detailed information about the job or career topic: ${message}`);
    } else {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        botMsg.innerHTML = "This doesn't seem to be a job-related query. In **Job Info** mode, I can help with career-related questions! Try asking something like:<br><br>" +
                           "- What are the qualifications for a Software Engineer?<br>" +
                           "- What does an Accountant do?<br>" +
                           "- How can I become a Data Scientist?<br><br>" +
                           "Please ask a job-related question, or switch to another mode.";
        chatDisplay.appendChild(botMsg);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
}

// Coding Question Handler
function handleCodingQuestion(message) {
    const codingKeywords = ['code', 'coding', 'program', 'programming', 'javascript', 'python', 'java', 'c++', 'algorithm', 'loop', 'function', 'array', 'string', 'variable', 'debug'];
    const isCodingRelated = codingKeywords.some(keyword => message.toLowerCase().includes(keyword));

    if (isCodingRelated) {
        fetchBotResponse(`Provide a detailed coding solution or explanation for: ${message}`);
    } else {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        botMsg.innerHTML = "This doesn't seem to be a coding-related query. In **Coding Questions** mode, I can help with programming-related questions! Try asking something like:<br><br>" +
                           "- How to write a loop in JavaScript?<br>" +
                           "- How to reverse a string in Python?<br>" +
                           "- What is a closure in JavaScript?<br><br>" +
                           "Please ask a coding-related question, or switch to another mode.";
        chatDisplay.appendChild(botMsg);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
}

// IT Calculation Handler
function handleITCalculation(message) {
    const itCalcKeywords = ['calculate', 'convert', 'binary', 'decimal', 'hex', 'octal', 'ip address', 'subnet', 'bit', 'byte', 'network', 'math', 'computation'];
    const isITCalcRelated = itCalcKeywords.some(keyword => message.toLowerCase().includes(keyword));

    if (isITCalcRelated) {
        fetchBotResponse(`Perform the IT-related calculation or conversion: ${message}`);
    } else {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        botMsg.innerHTML = "This doesn't seem to be an IT calculation-related query. In **IT Calculations** mode, I can help with IT-related computations! Try asking something like:<br><br>" +
                           "- Convert 1010 binary to decimal<br>" +
                           "- Calculate the subnet mask for an IP address<br>" +
                           "- How many bits are in a byte?<br><br>" +
                           "Please ask an IT calculation-related question, or switch to another mode.";
        chatDisplay.appendChild(botMsg);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
}

// AI News Handler (Using GNews API)
async function fetchAINews() {
    const loadingMsg = showLoadingMessage();
    try {
        const response = await fetch(`${GNEWS_API_URL}&page=${newsPage}`);
        if (!response.ok) {
            console.log('Response Headers:', response.headers); // Log headers for debugging
            throw new Error(`Status: ${response.status}`);
        }
        removeLoadingMessage(loadingMsg);
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
            data.articles.forEach(article => {
                const newsMsg = document.createElement('div');
                newsMsg.className = 'message bot-message';
                newsMsg.innerHTML = `<strong>${article.title}</strong><br>` +
                                   `${article.description || 'No description available.'}<br>` +
                                   `<a href="${article.url}" target="_blank">Read more</a><br>` +
                                   `<small>Published: ${new Date(article.publishedAt).toLocaleString()}</small>`;
                chatDisplay.appendChild(newsMsg);
            });

            // Add Load More button
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.textContent = 'Load More News';
            loadMoreBtn.addEventListener('click', () => {
                newsPage++;
                fetchAINews();
            });
            chatDisplay.appendChild(loadMoreBtn);
        } else {
            const noNewsMsg = document.createElement('div');
            noNewsMsg.className = 'message bot-message';
            noNewsMsg.innerHTML = "No more AI news articles available at the moment.";
            chatDisplay.appendChild(noNewsMsg);
        }
    } catch (error) {
        removeLoadingMessage(loadingMsg);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'message bot-message';
        if (error.message.includes('426')) {
            // Mock data as a fallback
            const mockArticles = [
                {
                    title: "AI Chatbots Outperform Doctors in Stanford Study",
                    description: "A recent Stanford study found that AI chatbots can diagnose medical conditions more accurately than human doctors, raising questions about the future of healthcare.",
                    url: "https://abc7news.com",
                    publishedAt: "2025-03-16T16:39:00Z"
                },
                {
                    title: "AI-Powered Search Results Expand to UK",
                    description: "Google is bringing its AI-powered search results to the UK, aiming to enhance user experience with more accurate and context-aware results.",
                    url: "https://www.independent.co.uk",
                    publishedAt: "2024-08-15T07:10:00Z"
                }
            ];
            mockArticles.forEach(article => {
                const newsMsg = document.createElement('div');
                newsMsg.className = 'message bot-message';
                newsMsg.innerHTML = `<strong>${article.title}</strong><br>` +
                                   `${article.description || 'No description available.'}<br>` +
                                   `<a href="${article.url}" target="_blank">Read more</a><br>` +
                                   `<small>Published: ${new Date(article.publishedAt).toLocaleString()}</small>`;
                chatDisplay.appendChild(newsMsg);
            });
            errorMsg.innerHTML = `Error fetching AI news: ${error.message}. Displaying sample articles instead.`;
        } else {
            errorMsg.innerHTML = `Error fetching AI news: ${error.message}`;
        }
        chatDisplay.appendChild(errorMsg);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
}

// Display Bot Message
function displayBotMessage(text) {
    const botMsg = document.createElement('div');
    botMsg.className = 'message bot-message';

    const parseMarkdown = (text) => {
        let formattedText = text.replace(/\n/g, '<br>');
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>');

        const lines = formattedText.split('<br>');
        let inList = false;
        let listItems = [];
        let newLines = [];

        lines.forEach((line, index) => {
            const listMatch = line.match(/^\d+\.\s*(.*)/);
            if (listMatch) {
                if (!inList) {
                    inList = true;
                    listItems = [];
                }
                listItems.push(`<li>${listMatch[1]}</li>`);
                if (index === lines.length - 1 || !lines[index + 1].match(/^\d+\.\s*/)) {
                    newLines.push(`<ul>${listItems.join('')}</ul>`);
                    inList = false;
                }
            } else {
                if (inList) {
                    newLines.push(`<ul>${listItems.join('')}</ul>`);
                    inList = false;
                }
                newLines.push(line);
            }
        });

        formattedText = newLines.join('<br>');
        return formattedText;
    };

    const formattedText = parseMarkdown(text);
    botMsg.innerHTML = `<strong>Response:</strong><br>${formattedText}`;
    chatDisplay.appendChild(botMsg);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});