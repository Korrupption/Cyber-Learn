[README.md](https://github.com/user-attachments/files/24169387/README.md)
CyberLearn - System Documentation

Project Overview
CyberLearn is an interactive cybersecurity education platform designed to help users build safer online habits through short lessons, quizzes, and resources.

---

System Details

Development Environment
- Operating System: Windows 10/11
- Code Editor: Visual Studio Code
- Primary Language: HTML, CSS (Tailwind CSS), JavaScript



System Access Credentials
- IDE: VS Code (locally hosted)

Project Structure

```
cyberlearn/
├── index.html                    # Redirects users straight to landing page
├── landing.html                  # Landing/welcome page
├── auth.html                     # LOGIN/SIGNUP page
├── dashboard.html                # User dashboard
├── lessons.html                  # Lessons overview page
├── lesson-intro.html             # Lesson introduction
├── lesson-1.html               
├── lesson-2.html               
├── lesson-3.html                 
├── lesson-4.html                
├── lesson-5.html                 
├── quiz.html                     # Quiz landing page
├── quiz-1.html                   
├── quiz-2.html                   
├── quiz-3.html                   
├── quiz-4.html                   
├── quiz-5.html                   
├── resources.html                
├── policy.html                   
├── encryption-demo.html          
├── assets/                       # Asset files
│   ├── images/                   # Image files
│   ├── Audio/                    # Audio files
│   └── js/                       # JavaScript files
│       ├── cyberlearn.js         
│       ├── encryption.js         
│       └── session-timeout.js    
└── README.md                     # This file
```

---

System Configuration

Front-End Technologies
- HTML5: Markup structure
- CSS: Tailwind CSS framework for styling
- JavaScript: Client-side scripting for interactivity

Key JavaScript Files

| File | Purpose |
|------|---------|
| `cyberlearn.js` | Main application logic, user interactions, page flow |
| `encryption.js` | Encryption demonstration and educational content |
| `session-timeout.js` | Session management and user timeout handling |

Features Implemented
- ✅ User Authentication (login system)
- ✅ Multi-lesson content delivery (5 lessons)
- ✅ Interactive quizzes (5 quizzes with gating)
- ✅ Encryption demonstrations
- ✅ Session timeout management
- ✅ Responsive design (mobile-friendly)
- ✅ Great for elderly users 

---

Running the Project

Method: Direct File Opening

1. Navigate to the project folder
2. Double-click `index.html`
3. Or open `index.html` with your preferred browser

---

Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Supported |
| Firefox | Latest | ✅ Supported |
| Edge | Latest | ✅ Supported |
| Safari | Latest | ✅ Supported |

---


Security Notes for Development

⚠️ **Important**: 
- Do not commit passwords or sensitive credentials to version control
- Test credentials are for development only
- Always use secure password practices in production
- Never store sensitive data in plain text in code files
