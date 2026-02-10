function renderPortfolioResponse() {
  var projects = SITE_DATA.projects;
  var categories = [];
  var seen = {};
  for (var i = 0; i < projects.length; i++) {
    if (!seen[projects[i].category]) {
      seen[projects[i].category] = true;
      categories.push({ value: projects[i].category, label: projects[i].categoryLabel });
    }
  }

  var filterHtml = '<div class="stream-block"><div class="filter-bar" aria-label="Project filters">';
  filterHtml += '<button class="filter-btn active" type="button" data-filter="all">All</button>';
  for (var c = 0; c < categories.length; c++) {
    filterHtml += '<button class="filter-btn" type="button" data-filter="' + categories[c].value + '">' + categories[c].label + '</button>';
  }
  filterHtml += '</div></div>';

  var cardsHtml = '<div class="stream-block"><div class="grid grid-2" id="projectGrid">';
  for (var p = 0; p < projects.length; p++) {
    var proj = projects[p];
    var linksHtml = '<div class="btn-row">';
    for (var l = 0; l < proj.links.length; l++) {
      var link = proj.links[l];
      var cls = link.primary ? 'btn btn-primary' : 'btn btn-secondary';
      if (link.chatAction) {
        linksHtml += '<button class="' + cls + ' chat-action-btn" type="button" data-chat-action="' + link.chatAction + '">' + link.label + '</button>';
      } else {
        var ext = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        linksHtml += '<a class="' + cls + '" href="' + link.url + '"' + ext + '>' + link.label + '</a>';
      }
    }
    linksHtml += '</div>';

    cardsHtml += '<article class="project-card" data-category="' + proj.category + '">';
    cardsHtml += '<div class="project-image"><img src="' + proj.image + '" alt="' + proj.title + ' preview" loading="lazy"' + (proj.image.indexOf('youtube') > -1 ? ' referrerpolicy="no-referrer"' : '') + '></div>';
    cardsHtml += '<div class="project-body">';
    cardsHtml += '<p class="meta">' + proj.categoryLabel + '</p>';
    cardsHtml += '<h3>' + proj.title + '</h3>';
    cardsHtml += '<p class="project-desc">' + proj.description + '</p>';
    cardsHtml += linksHtml;
    cardsHtml += '</div></article>';
  }
  cardsHtml += '</div></div>';

  return '<p class="stream-block">Evan\'s portfolio spans eLearning development, motion design, cloud-focused course design, and visual template systems. Here\'s a look at the selected work — you can filter by category:</p>'
    + filterHtml
    + cardsHtml
    + '<p class="stream-block response-followup">Use the filters to narrow by type. Want to know more about a specific project? Just ask.</p>';
}

function renderBlogResponse() {
  var blog = SITE_DATA.blog;

  var html = '<p class="stream-block">Evan writes about the intersection of instructional design, cloud technology, and generative AI. Here\'s the latest:</p>';

  html += '<div class="stream-block"><h3>' + blog.featured.title + '</h3>';
  html += '<p class="meta">Latest Post · ' + blog.featured.date + '</p>';
  html += '<p>' + blog.featured.summary + '</p>';
  html += '<blockquote class="quote">' + blog.featured.quote + '</blockquote></div>';

  html += '<p class="stream-block">There are also a few posts in the works:</p>';

  html += '<ul class="stream-block prose-list">';
  for (var i = 0; i < blog.upcoming.length; i++) {
    var post = blog.upcoming[i];
    html += '<li><strong>' + post.title + '</strong> — ' + post.summary + '</li>';
  }
  html += '</ul>';

  html += '<p class="stream-block response-followup">These posts are in progress. Ask about any of these topics for more details.</p>';

  return html;
}

function renderAboutResponse() {
  var about = SITE_DATA.about;

  var html = '<p class="stream-block">' + about.intro + '</p>';

  // KPIs as inline highlights
  html += '<div class="stream-block kpi-grid">';
  for (var k = 0; k < about.kpis.length; k++) {
    html += '<div class="kpi"><strong>' + about.kpis[k].value + '</strong><span>' + about.kpis[k].label + '</span></div>';
  }
  html += '</div>';

  // Approach as prose
  html += '<div class="stream-block"><h3>' + about.approach.heading + '</h3>';
  html += '<p>' + about.approach.text + '</p>';
  html += '<blockquote class="quote">' + about.approach.quote + '</blockquote></div>';

  // Focus areas inline
  html += '<div class="stream-block"><p style="margin-bottom: 0.5rem;">Day to day, Evan focuses on:</p>';
  html += '<div class="tags">';
  for (var f = 0; f < about.focusAreas.length; f++) {
    html += '<span class="tag">' + about.focusAreas[f] + '</span>';
  }
  html += '</div></div>';

  // Toolkit as compact lists
  html += '<div class="stream-block"><h3>Toolkit</h3>';
  html += '<div class="grid grid-2">';
  for (var t = 0; t < about.toolkit.length; t++) {
    var tool = about.toolkit[t];
    html += '<div class="toolkit-group"><h4>' + tool.title + '</h4>';
    html += '<div class="tags">';
    for (var tg = 0; tg < tool.tags.length; tg++) {
      html += '<span class="tag">' + tool.tags[tg] + '</span>';
    }
    html += '</div></div>';
  }
  html += '</div></div>';

  // Certs as a list
  html += '<div class="stream-block"><h3>Certifications</h3><ul class="prose-list">';
  for (var c = 0; c < about.certifications.length; c++) {
    var cert = about.certifications[c];
    html += '<li><strong>' + cert.title + '</strong> — ' + cert.year + '</li>';
  }
  html += '</ul></div>';

  // Education as a list
  html += '<div class="stream-block"><h3>Education</h3><ul class="prose-list">';
  for (var e = 0; e < about.education.length; e++) {
    var edu = about.education[e];
    html += '<li><strong>' + edu.degree + '</strong> — ' + edu.school + ' (' + edu.year + ')' + (edu.note ? ' · ' + edu.note : '') + '</li>';
  }
  html += '</ul></div>';

  html += '<p class="stream-block response-followup">Want to see Evan\'s work in action? Ask about projects, or get in touch.</p>';

  return html;
}

function renderContactResponse() {
  var contact = SITE_DATA.contact;

  var html = '<p class="stream-block">Evan is open to new projects. If you\'re planning a learning program or want help making complex topics easier to teach, here\'s how to connect:</p>';

  html += '<div class="stream-block contact-channels">';
  html += '<div class="contact-channel">';
  html += '<h3>Email</h3>';
  html += '<p><a href="mailto:' + contact.email + '">' + contact.email + '</a> — best for project inquiries, consulting requests, or collaboration ideas.</p>';
  html += '</div>';
  html += '<div class="contact-channel">';
  html += '<h3>LinkedIn</h3>';
  html += '<p><a href="' + contact.linkedin + '" target="_blank" rel="noopener noreferrer">' + contact.linkedinLabel + '</a> — message Evan directly if you prefer to start there.</p>';
  html += '</div>';
  html += '</div>';

  html += '<div class="stream-block"><p style="margin-bottom: 0.5rem;">Typical engagements include:</p>';
  html += '<div class="tags">';
  for (var i = 0; i < contact.engagementTypes.length; i++) {
    html += '<span class="tag">' + contact.engagementTypes[i] + '</span>';
  }
  html += '</div></div>';

  html += '<p class="stream-block response-followup">Evan typically responds within a day. Feel free to reach out anytime.</p>';

  return html;
}

function renderTemplatesResponse() {
  var t = SITE_DATA.templates;

  var html = '<p class="stream-block">' + t.intro + '</p>';

  html += '<div class="stream-block"><h3>Building the Visual Framework</h3>';
  html += '<p>' + t.approach + '</p>';
  html += '<blockquote class="quote">' + t.approachQuote + '</blockquote></div>';

  html += '<p class="stream-block">Here are the six template themes in the collection:</p>';

  for (var i = 0; i < t.items.length; i++) {
    var item = t.items[i];
    html += '<div class="stream-block template-entry">';
    html += '<a class="template-thumb" href="' + item.image + '" target="_blank" rel="noopener noreferrer"><img src="' + item.image + '" alt="' + item.title + ' template preview" loading="lazy"></a>';
    html += '<div class="template-info">';
    html += '<h4>' + item.title + '</h4>';
    html += '<p class="meta" style="margin-bottom: 0.2rem;">' + item.theme + '</p>';
    html += '<p style="margin: 0;">' + item.desc + '</p>';
    html += '</div></div>';
  }

  html += '<div class="stream-block"><h3>Design Principles</h3><ul class="prose-list">';
  for (var p = 0; p < t.principles.length; p++) {
    html += '<li><strong>' + t.principles[p].title + '</strong> — ' + t.principles[p].desc + '</li>';
  }
  html += '</ul></div>';

  html += '<p class="stream-block response-followup">Click any thumbnail to view the full layout. Want to discuss a custom template?</p>';

  return html;
}

function renderFallbackResponse() {
  return '<p class="stream-block">I can help with questions about Evan\'s projects, background, blog, and availability. Try one of the suggestions below, or ask something like:</p>'
    + '<ul class="stream-block prose-list">'
    + '<li>"What projects have you worked on?"</li>'
    + '<li>"Tell me about your background"</li>'
    + '<li>"What have you been writing?"</li>'
    + '<li>"Are you available for new work?"</li>'
    + '</ul>';
}
