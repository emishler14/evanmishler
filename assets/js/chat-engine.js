(function () {
  var chatShell = document.getElementById('chatShell');
  var chatMessages = document.getElementById('chatMessages');
  var chatForm = document.getElementById('chatForm');
  var promptInput = document.getElementById('prompt');
  var suggestionCards = document.querySelectorAll('.suggestion-card');

  var STREAM_INTERVAL = 80; // ms between each block reveal

  // Keyword routing map (order matters — more specific routes first)
  var routes = [
    { keywords: ['chatbot', 'this chat', 'this site', 'built this', 'how was this'], handler: renderChatbotResponse },
    { keywords: ['right for', 'job fit', 'right for my role', 'job description', 'candidate'], handler: renderJobFitResponse },
    { keywords: ['template', 'storyline template', 'design template', 'visual framework'], handler: renderTemplatesResponse },
    { keywords: ['project', 'portfolio', 'work', 'projects', 'show me'], handler: renderPortfolioResponse },
    { keywords: ['blog', 'post', 'writing', 'wrote', 'article', 'read'], handler: renderBlogResponse },
    { keywords: ['expert', 'about', 'background', 'who', 'tell me', 'yourself', 'experience', 'bio', 'actually an expert'], handler: renderAboutResponse },
    { keywords: ['contact', 'available', 'hire', 'email', 'reach', 'connect', 'linkedin'], handler: renderContactResponse }
  ];

  // Chat action mapping (for in-chat buttons that trigger new responses)
  var chatActions = {
    templates: { question: 'Tell me about the Storyline Design Templates', handler: renderTemplatesResponse }
  };

  // Topic-to-question mapping for suggestion cards
  var topicQuestions = {
    expert: 'Is he actually an expert?',
    projects: 'Show me the projects',
    chatbot: "What's this chatbot all about?",
    jobfit: 'Is Evan right for my role?'
  };

  function route(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < routes.length; i++) {
      for (var k = 0; k < routes[i].keywords.length; k++) {
        if (lower.indexOf(routes[i].keywords[k]) > -1) {
          return routes[i].handler;
        }
      }
    }
    return renderFallbackResponse;
  }

  function addUserMessage(text) {
    var msg = document.createElement('div');
    msg.className = 'msg msg--user';
    msg.innerHTML = '<div class="msg-body">' + escapeHtml(text) + '</div>';
    chatMessages.appendChild(msg);
  }

  function addBotMessage(html, callback) {
    var msg = document.createElement('div');
    msg.className = 'msg msg--bot';

    var bodyDiv = document.createElement('div');
    bodyDiv.className = 'msg-body';
    bodyDiv.innerHTML = html;

    msg.innerHTML = '<div class="msg-avatar"><img src="assets/images/em-icon-doodle-1.svg" alt="EM"></div>';
    msg.appendChild(bodyDiv);
    chatMessages.appendChild(msg);

    // Stream-reveal: find all .stream-block children and reveal them sequentially
    var blocks = bodyDiv.querySelectorAll('.stream-block');
    if (blocks.length === 0) {
      // No stream blocks, just show everything
      if (callback) callback();
      return;
    }

    // Hide all blocks initially
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].classList.add('stream-hidden');
    }

    // Reveal them one at a time
    var idx = 0;
    function revealNext() {
      if (idx >= blocks.length) {
        if (callback) callback();
        return;
      }
      blocks[idx].classList.remove('stream-hidden');
      blocks[idx].classList.add('stream-visible');
      scrollToBottom();
      idx++;
      setTimeout(revealNext, STREAM_INTERVAL);
    }

    revealNext();
  }

  function showTypingIndicator() {
    var indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<div class="msg-avatar"><img src="assets/images/em-icon-doodle-1.svg" alt=""></div>'
      + '<div class="typing-dots"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(indicator);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    var indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  var chatWelcome = document.getElementById('chatWelcome');

  function activateChatState() {
    if (!chatShell.classList.contains('has-messages')) {
      var chatBottom = document.querySelector('.chat-bottom');

      // Capture form position before layout change
      var startRect = chatBottom.getBoundingClientRect();

      // Animate welcome out
      if (chatWelcome) {
        chatWelcome.classList.add('departing');
      }

      setTimeout(function () {
        // Apply the layout change
        chatShell.classList.add('has-messages');

        // Capture new position and FLIP animate
        var endRect = chatBottom.getBoundingClientRect();
        var deltaY = startRect.top - endRect.top;

        if (deltaY !== 0) {
          chatBottom.style.transition = 'none';
          chatBottom.style.transform = 'translateY(' + deltaY + 'px)';

          // Force reflow so the browser registers the starting transform
          chatBottom.offsetHeight; // eslint-disable-line no-unused-expressions

          chatBottom.style.transition = 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)';
          chatBottom.style.transform = 'translateY(0)';

          chatBottom.addEventListener('transitionend', function handler() {
            chatBottom.style.transition = '';
            chatBottom.style.transform = '';
            chatBottom.removeEventListener('transitionend', handler);
          });
        }
      }, 300);
    }
  }

  function initResponseInteractions() {
    // Chat action buttons (e.g. "View Templates" triggers an in-chat response)
    var actionBtns = chatMessages.querySelectorAll('.chat-action-btn:not([data-bound])');
    for (var a = 0; a < actionBtns.length; a++) {
      actionBtns[a].setAttribute('data-bound', '1');
      actionBtns[a].addEventListener('click', function (e) {
        var action = e.currentTarget.getAttribute('data-chat-action');
        var actionDef = chatActions[action];
        if (actionDef) {
          handleSubmit(actionDef.question);
        }
      });
    }

    // Job description form
    var jobForms = chatMessages.querySelectorAll('.job-desc-form:not([data-bound])');
    for (var j = 0; j < jobForms.length; j++) {
      jobForms[j].setAttribute('data-bound', '1');
      jobForms[j].addEventListener('submit', function (e) {
        e.preventDefault();
        var textarea = e.currentTarget.querySelector('.job-desc-input');
        var text = textarea.value.trim();
        if (!text) return;
        // Disable the form after submission
        textarea.disabled = true;
        e.currentTarget.querySelector('.job-desc-submit').disabled = true;
        handleJobDescriptionSubmit(text);
      });
    }

    // Portfolio filter buttons
    var grids = chatMessages.querySelectorAll('#projectGrid');
    if (grids.length === 0) return;

    var lastGrid = grids[grids.length - 1];

    // Walk back to find the filter-bar
    var lastFilterBar = null;
    if (lastGrid) {
      var walker = lastGrid.parentElement;
      if (walker) walker = walker.previousElementSibling;
      while (walker) {
        var fb = walker.querySelector('.filter-bar');
        if (fb) { lastFilterBar = fb; break; }
        if (walker.classList && walker.classList.contains('filter-bar')) { lastFilterBar = walker; break; }
        walker = walker.previousElementSibling;
      }
    }

    if (lastFilterBar && lastGrid) {
      var btns = lastFilterBar.querySelectorAll('.filter-btn');
      var cards = lastGrid.querySelectorAll('.project-card');

      for (var b = 0; b < btns.length; b++) {
        btns[b].addEventListener('click', (function (buttons, projectCards) {
          return function (e) {
            var filter = e.currentTarget.getAttribute('data-filter');
            for (var i = 0; i < buttons.length; i++) {
              buttons[i].classList.remove('active');
            }
            e.currentTarget.classList.add('active');

            for (var j = 0; j < projectCards.length; j++) {
              if (filter === 'all' || projectCards[j].getAttribute('data-category') === filter) {
                projectCards[j].style.display = '';
              } else {
                projectCards[j].style.display = 'none';
              }
            }
          };
        })(btns, cards));
      }
    }
  }

  function handleJobDescriptionSubmit(jobText) {
    var lower = jobText.toLowerCase();

    // Skill matching against Evan's background
    var skillMap = [
      { keywords: ['instructional design', 'learning design', 'curriculum', 'training design', 'l&d', 'learning and development', 'learning & development'], label: 'Instructional Design', strength: 'core' },
      { keywords: ['elearning', 'e-learning', 'articulate', 'storyline', 'rise', 'scorm', 'xapi', 'lms'], label: 'eLearning Development', strength: 'core' },
      { keywords: ['video', 'motion graphics', 'premiere', 'after effects', 'animation', 'video production', 'media production'], label: 'Video & Motion Design', strength: 'core' },
      { keywords: ['aws', 'amazon web services', 'cloud', 'azure', 'gcp'], label: 'Cloud Technologies', strength: 'core' },
      { keywords: ['ai', 'artificial intelligence', 'generative ai', 'machine learning', 'llm', 'prompt', 'chatgpt', 'genai'], label: 'Generative AI', strength: 'core' },
      { keywords: ['adobe', 'photoshop', 'illustrator', 'creative suite', 'graphic design'], label: 'Adobe Creative Suite', strength: 'strong' },
      { keywords: ['project management', 'stakeholder', 'cross-functional', 'agile', 'program management'], label: 'Project Management', strength: 'strong' },
      { keywords: ['mba', 'business', 'strategy', 'operations', 'leadership'], label: 'Business Strategy (MBA)', strength: 'strong' },
      { keywords: ['content', 'writing', 'copywriting', 'technical writing', 'documentation'], label: 'Content Development', strength: 'strong' },
      { keywords: ['web', 'html', 'css', 'javascript', 'frontend', 'front-end'], label: 'Web Development', strength: 'growing' }
    ];

    var matches = [];
    var partials = [];
    for (var i = 0; i < skillMap.length; i++) {
      for (var k = 0; k < skillMap[i].keywords.length; k++) {
        if (lower.indexOf(skillMap[i].keywords[k]) > -1) {
          if (skillMap[i].strength === 'core') {
            matches.push(skillMap[i].label);
          } else {
            partials.push(skillMap[i].label);
          }
          break;
        }
      }
    }

    var html = '';
    if (matches.length >= 2) {
      html += '<p class="stream-block">This looks like a strong match. Based on the job description, Evan\'s experience directly aligns in <strong>' + matches.length + ' core areas</strong>:</p>';
      html += '<div class="stream-block"><div class="tags">';
      for (var m = 0; m < matches.length; m++) {
        html += '<span class="tag" style="border-color: var(--accent); color: var(--text);">' + matches[m] + '</span>';
      }
      html += '</div></div>';
    } else if (matches.length === 1) {
      html += '<p class="stream-block">There\'s a solid connection here. Evan\'s background aligns clearly with <strong>' + matches[0] + '</strong>.</p>';
    } else {
      html += '<p class="stream-block">Evan\'s background doesn\'t match this role\'s core requirements directly, but there may be adjacent skills worth exploring.</p>';
    }

    if (partials.length > 0) {
      html += '<p class="stream-block">He also brings relevant supporting experience in:</p>';
      html += '<div class="stream-block"><div class="tags">';
      for (var p = 0; p < partials.length; p++) {
        html += '<span class="tag">' + partials[p] + '</span>';
      }
      html += '</div></div>';
    }

    html += '<div class="stream-block"><p>With 13+ years in L&D, an MBA, and AWS + Google Cloud certifications, Evan brings both depth and breadth. He\'s especially strong when the role involves translating complex technical topics into clear learning experiences.</p></div>';
    html += '<p class="stream-block response-followup">Want to <a href="mailto:' + SITE_DATA.contact.email + '">reach out directly</a>? Or ask me anything else about his background.</p>';

    addUserMessage('Here\'s the job description I\'d like to check.');
    scrollToBottom();
    showTypingIndicator();

    setTimeout(function () {
      hideTypingIndicator();
      addBotMessage(html, function () {
        initResponseInteractions();
      });
    }, 500 + Math.floor(Math.random() * 300));
  }

  function handleSubmit(text) {
    text = text.trim();
    if (!text) return;

    var isFirst = !chatShell.classList.contains('has-messages');
    activateChatState();

    var handler = route(text);

    // Wait for layout transition on first message, then show messages
    var layoutDelay = isFirst ? 550 : 0;

    setTimeout(function () {
      addUserMessage(text);
      scrollToBottom();
      showTypingIndicator();

      var responseDelay = 400 + Math.floor(Math.random() * 200);

      setTimeout(function () {
        hideTypingIndicator();
        addBotMessage(handler(), function () {
          initResponseInteractions();
        });
      }, responseDelay);
    }, layoutDelay);
  }

  // Form submit
  if (chatForm) {
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = promptInput.value;
      promptInput.value = '';
      promptInput.style.height = 'auto';
      handleSubmit(text);
      promptInput.focus();
    });
  }

  // Enter to send (Shift+Enter for newline)
  if (promptInput) {
    promptInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });

    // Auto-resize textarea
    promptInput.addEventListener('input', function () {
      promptInput.style.height = 'auto';
      promptInput.style.height = Math.min(promptInput.scrollHeight, 160) + 'px';
    });
  }

  // Suggestion card clicks
  for (var s = 0; s < suggestionCards.length; s++) {
    suggestionCards[s].addEventListener('click', function (e) {
      var topic = e.currentTarget.getAttribute('data-topic');
      var questionText = topicQuestions[topic];
      if (questionText) {
        handleSubmit(questionText);
      }
    });
  }
})();
