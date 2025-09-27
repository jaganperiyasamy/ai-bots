// Global variables
let currentBot = null;
let chatMessages = [];
let botsData = [];
let isTyping = false;

// Google Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyDsqL_mFn2pSYV_3QEm79Ojb0_hDP3WSFY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize navigation
    initializeNavigation();
    
    // Initialize marketplace
    initializeMarketplace();
    
    // Initialize chat modal
    initializeChatModal();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Load sample data
    loadSampleData();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Active link highlighting
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Mobile menu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Marketplace functionality
function initializeMarketplace() {
    const companyFilter = document.getElementById('companyFilter');
    const levelFilter = document.getElementById('levelFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    
    // Filter event listeners
    [companyFilter, levelFilter, categoryFilter, searchInput].forEach(element => {
        if (element) {
            element.addEventListener('input', filterBots);
        }
    });
    
    // Hero action buttons
    const startTrainingBtn = document.querySelector('.hero-actions .btn-primary');
    const learnMoreBtn = document.querySelector('.hero-actions .btn-outline');
    
    if (startTrainingBtn) {
        startTrainingBtn.addEventListener('click', function() {
            document.getElementById('marketplace').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function filterBots() {
    const companyFilter = document.getElementById('companyFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredBots = botsData.filter(bot => {
        const matchesCompany = !companyFilter || bot.company === companyFilter;
        const matchesLevel = !levelFilter || bot.level === levelFilter;
        const matchesCategory = !categoryFilter || bot.category === categoryFilter;
        const matchesSearch = !searchInput || 
            bot.name.toLowerCase().includes(searchInput) ||
            bot.description.toLowerCase().includes(searchInput) ||
            bot.company.toLowerCase().includes(searchInput);
        
        return matchesCompany && matchesLevel && matchesCategory && matchesSearch;
    });
    
    renderBots(filteredBots);
}

function renderBots(bots) {
    const botsGrid = document.getElementById('botsGrid');
    if (!botsGrid) return;
    
    botsGrid.innerHTML = '';
    
    if (bots.length === 0) {
        botsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <h3>No bots found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    bots.forEach(bot => {
        const botCard = createBotCard(bot);
        botsGrid.appendChild(botCard);
    });
}

function createBotCard(bot) {
    const card = document.createElement('div');
    card.className = 'bot-item fade-in-up';
    card.innerHTML = `
        <div class="bot-item-header">
            <div class="bot-item-avatar">
                <i class="${bot.icon}"></i>
            </div>
            <div class="bot-item-info">
                <h3>${bot.name}</h3>
                <p>${bot.company} • ${bot.level}</p>
            </div>
        </div>
        <div class="bot-item-details">
            <p style="color: #64748b; margin-bottom: 12px; line-height: 1.5;">${bot.description}</p>
            <div class="bot-tags">
                <span class="bot-tag">${bot.category}</span>
                <span class="bot-tag">${bot.specialty}</span>
            </div>
            <div class="bot-rating">
                <div class="stars">
                    ${generateStars(bot.rating)}
                </div>
                <span class="rating-text">${bot.rating} (${bot.reviews} reviews)</span>
            </div>
            <div class="bot-price">
                <span class="price">$${bot.price}</span>
                <span class="price-period">/hour</span>
            </div>
        </div>
        <div class="bot-actions">
            <button class="btn-primary" onclick="startChat('${bot.id}')">
                <i class="fas fa-comments"></i>
                Start Training
            </button>
            <button class="btn-outline" onclick="viewDetails('${bot.id}')">
                <i class="fas fa-info-circle"></i>
                Details
            </button>
        </div>
    `;
    
    return card;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Chat modal functionality
function initializeChatModal() {
    const chatModal = document.getElementById('chatModal');
    const closeChat = document.getElementById('closeChat');
    const sendMessage = document.getElementById('sendMessage');
    const messageInput = document.getElementById('messageInput');
    const quickActions = document.querySelectorAll('.quick-btn');
    
    // Close modal
    if (closeChat) {
        closeChat.addEventListener('click', closeChatModal);
    }
    
    // Close modal when clicking outside
    if (chatModal) {
        chatModal.addEventListener('click', function(e) {
            if (e.target === chatModal) {
                closeChatModal();
            }
        });
    }
    
    // Send message
    if (sendMessage) {
        sendMessage.addEventListener('click', sendChatMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Quick actions
    quickActions.forEach(btn => {
        btn.addEventListener('click', function() {
            const message = this.getAttribute('data-message');
            messageInput.value = message;
            sendChatMessage();
        });
    });
}

function startChat(botId) {
    const bot = botsData.find(b => b.id === botId);
    if (!bot) return;
    
    currentBot = bot;
    chatMessages = [];
    
    // Update chat header
    const chatBotName = document.getElementById('chatBotName');
    if (chatBotName) {
        chatBotName.textContent = bot.name;
    }
    
    // Clear messages and add welcome message
    const chatMessagesContainer = document.getElementById('chatMessages');
    if (chatMessagesContainer) {
        chatMessagesContainer.innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">
                    <i class="${bot.icon}"></i>
                </div>
                <div class="message-content">
                    <p>Hello! I'm your ${bot.name} training bot. I'm here to help you prepare for your ${bot.company} placement interviews. What would you like to practice today?</p>
                    <span class="message-time">Just now</span>
                </div>
            </div>
        `;
    }
    
    // Show modal
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // Focus input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        setTimeout(() => messageInput.focus(), 100);
    }
}

function closeChatModal() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Enhanced sendChatMessage with Gemini API
async function sendChatMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || !currentBot || isTyping) return;
    
    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get AI response from Gemini API
        const botResponse = await getGeminiResponse(message);
        hideTypingIndicator();
        addMessage(botResponse, 'bot');
    } catch (error) {
        console.error('Error getting AI response:', error);
        hideTypingIndicator();
        
        // Fallback to local response if API fails
        const fallbackResponse = generateFallbackResponse(message);
        addMessage(fallbackResponse, 'bot');
    }
}

function addMessage(content, sender) {
    const chatMessagesContainer = document.getElementById('chatMessages');
    if (!chatMessagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <p>${content}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${currentBot.icon}"></i>
            </div>
            <div class="message-content">
                <p>${content}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
    }
    
    chatMessagesContainer.appendChild(messageDiv);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    
    // Store message
    chatMessages.push({ content, sender, time });
}

// Google Gemini API Integration
async function getGeminiResponse(userMessage) {
    const systemPrompt = createSystemPrompt();
    
    const requestBody = {
        contents: [{
            parts: [{
                text: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
        }
    };
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
}

function createSystemPrompt() {
    if (!currentBot) return '';
    
    const companyInfo = getCompanySpecificInfo(currentBot.company);
    
    return `You are an AI interview training bot specialized in ${currentBot.company} placement interviews. Help students prepare for ${currentBot.company} interviews focusing on ${currentBot.specialty}.

Company: ${currentBot.company}
Specialty: ${currentBot.specialty}
Level: ${currentBot.level}
Culture: ${companyInfo.culture}
Topics: ${companyInfo.topics}

Provide specific interview questions, feedback, and insights about ${currentBot.company}'s interview process. Be encouraging and professional.`;
}

function getCompanySpecificInfo(company) {
    const companyInfo = {
        google: {
            culture: "Innovation, user focus, technical excellence",
            topics: "Algorithms, data structures, system design, behavioral questions"
        },
        microsoft: {
            culture: "Growth mindset, customer obsession, continuous learning",
            topics: "System design, cloud computing, behavioral questions"
        },
        amazon: {
            culture: "Customer obsession, ownership, high standards",
            topics: "Leadership principles, behavioral questions, system design"
        },
        meta: {
            culture: "Move fast, be bold, focus on impact",
            topics: "Product design, behavioral questions, system design"
        },
        apple: {
            culture: "Simplicity, attention to detail, innovation",
            topics: "Product design, user experience, behavioral questions"
        },
        netflix: {
            culture: "Freedom and responsibility, high performance",
            topics: "Culture fit, behavioral questions, system design"
        },
        uber: {
            culture: "Customer obsession, boldness",
            topics: "System design, behavioral questions"
        },
        airbnb: {
            culture: "Belong anywhere, hospitality",
            topics: "Customer experience, behavioral questions"
        }
    };
    
    return companyInfo[company] || {
        culture: "Innovation, collaboration, excellence",
        topics: "Technical skills, behavioral questions"
    };
}

function showTypingIndicator() {
    isTyping = true;
    const chatMessagesContainer = document.getElementById('chatMessages');
    if (!chatMessagesContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${currentBot.icon}"></i>
        </div>
        <div class="message-content">
            <div class="typing-animation">
                <span></span>
                <span></span>
                <span></span>
                 </div>
        </div>
`;
    chatMessagesContainer.appendChild(typingDiv);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function generateFallbackResponse(message) {
    return `I'm having trouble connecting to the AI service right now. Please try again in a moment. In the meantime, I can help you with ${currentBot.company} interview preparation!`;
}
function initializeDashboard() {
    console.log('Dashboard initialized');
}

function loadSampleData() {
    botsData = [
        {
            id: 'google-tech',
            name: 'Google Technical Bot',
            company: 'google',
            level: 'advanced',
            category: 'technical',
            specialty: 'Algorithms & Data Structures',
            description: 'Master Google\'s technical interview process with our specialized bot trained on real Google interview patterns.',
            icon: 'fas fa-brain',
            rating: 4.9,
            reviews: 1247,
            price: 25
        },
        {
            id: 'microsoft-system',
            name: 'Microsoft System Design Bot',
            company: 'microsoft',
            level: 'intermediate',
            category: 'system-design',
            specialty: 'System Architecture',
            description: 'Practice system design interviews with Microsoft\'s approach to scalable architecture and distributed systems.',
            icon: 'fas fa-code',
            rating: 4.8,
            reviews: 892,
            price: 22
        },
        {
            id: 'amazon-leadership',
            name: 'Amazon Leadership Bot',
            company: 'amazon',
            level: 'intermediate',
            category: 'leadership',
            specialty: 'Leadership Principles',
            description: 'Master Amazon\'s 14 Leadership Principles with our specialized behavioral interview training bot.',
            icon: 'fas fa-chart-line',
            rating: 4.7,
            reviews: 756,
            price: 20
        },
        {
            id: 'meta-behavioral',
            name: 'Meta Behavioral Bot',
            company: 'meta',
            level: 'beginner',
            category: 'behavioral',
            specialty: 'Culture Fit',
            description: 'Practice Meta\'s unique behavioral questions focusing on impact, authenticity, and innovation.',
            icon: 'fas fa-users',
            rating: 4.6,
            reviews: 634,
            price: 18
        },
        {
            id: 'apple-product',
            name: 'Apple Product Design Bot',
            company: 'apple',
            level: 'advanced',
            category: 'technical',
            specialty: 'Product Design',
            description: 'Learn Apple\'s approach to product design interviews with focus on user experience and innovation.',
            icon: 'fas fa-mobile-alt',
            rating: 4.8,
            reviews: 523,
            price: 28
        },
        {
            id: 'netflix-culture',
            name: 'Netflix Culture Bot',
            company: 'netflix',
            level: 'intermediate',
            category: 'behavioral',
            specialty: 'Culture & Values',
            description: 'Understand Netflix\'s unique culture and practice questions about freedom, responsibility, and impact.',
            icon: 'fas fa-play',
            rating: 4.5,
            reviews: 445,
            price: 19
        },
        {
            id: 'uber-system',
            name: 'Uber System Design Bot',
            company: 'uber',
            level: 'advanced',
            category: 'system-design',
            specialty: 'Real-time Systems',
            description: 'Practice designing real-time systems like Uber\'s ride-matching algorithm and global infrastructure.',
            icon: 'fas fa-car',
            rating: 4.7,
            reviews: 389,
            price: 24
        },
        {
            id: 'airbnb-behavioral',
            name: 'Airbnb Behavioral Bot',
            company: 'airbnb',
            level: 'beginner',
            category: 'behavioral',
            specialty: 'Customer Focus',
            description: 'Master Airbnb\'s customer-centric behavioral questions and hospitality-focused scenarios.',
            icon: 'fas fa-home',
            rating: 4.4,
            reviews: 312,
            price: 17
        }
    ];
    
    renderBots(botsData);
}

function initializeSmoothScrolling() {
    console.log('Smooth scrolling initialized');
}

function viewDetails(botId) {
    const bot = botsData.find(b => b.id === botId);
    if (!bot) return;
    alert(`${bot.name}\n\n${bot.description}`);
}