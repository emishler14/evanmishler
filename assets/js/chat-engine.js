(function () {
  var chatShell = document.getElementById('chatShell');
  var chatMessages = document.getElementById('chatMessages');
  var chatForm = document.getElementById('chatForm');
  var promptInput = document.getElementById('prompt');
  var suggestionCards = document.querySelectorAll('.suggestion-card');

  var STREAM_INTERVAL = 80; // ms between each block reveal

  // Keyword routing map
  var routes = [
    { keywords: ['template', 'storyline template', 'design template', 'visual framework'], handler: renderTemplatesResponse },
    { keywords: ['project', 'portfolio', 'work', 'projects'], handler: renderPortfolioResponse },
    { keywords: ['blog', 'post', 'writing', 'wrote', 'article', 'read'], handler: renderBlogResponse },
    { keywords: ['about', 'background', 'who', 'tell me', 'yourself', 'experience', 'bio'], handler: renderAboutResponse },
    { keywords: ['contact', 'available', 'hire', 'email', 'reach', 'connect', 'linkedin'], handler: renderContactResponse }
  ];

  // Chat action mapping (for in-chat buttons that trigger new responses)
  var chatActions = {
    templates: { question: 'Tell me about the Storyline Design Templates', handler: renderTemplatesResponse }
  };

  // Topic-to-question mapping for suggestion cards
  var topicQuestions = {
    projects: 'What projects have you worked on?',
    blog: 'What is your latest blog post?',
    about: 'Tell me a little bit about you.',
    contact: 'Are you available for new projects?'
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

    msg.innerHTML = '<div class="msg-avatar"><img src="assets/images/em-mark-alt-geo.svg" alt="EM"></div>';
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
    indicator.innerHTML = '<div class="msg-avatar"><img src="assets/images/em-mark-alt-geo.svg" alt=""></div>'
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
      // Animate welcome out, then switch layout
      if (chatWelcome) {
        chatWelcome.classList.add('departing');
      }
      setTimeout(function () {
        chatShell.classList.add('has-messages');
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

  function handleSubmit(text) {
    text = text.trim();
    if (!text) return;

    var isFirst = !chatShell.classList.contains('has-messages');
    activateChatState();

    var handler = route(text);

    // Wait for layout transition on first message, then show messages
    var layoutDelay = isFirst ? 350 : 0;

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
