(function () {
  var app = document.getElementById("app");
  var body = document.body;
  var data = null;
  var version = "20260826-15";
  var currentPage = body ? body.getAttribute("data-page") || "about" : "about";
  var currentAward = body ? body.getAttribute("data-award") || "" : "";

  if (!app || !body) {
    return;
  }

  var navigation = [
    { key: "about", href: "index.html?v=" + version, label: "Aim and Scope" },
    { key: "organization", href: "member.html?v=" + version, label: "Organization" },
    { key: "officers", href: "officer.html?v=" + version, label: "Officer" },
    { key: "activities", href: "activity.html?v=" + version, label: "Activities" },
    { key: "journals", href: "journal.html?v=" + version, label: "Journals" },
    { key: "news", href: "hinews.html?v=" + version, label: "HI News" },
    { key: "newsletters", href: "letter.html?v=" + version, label: "Newsletter" },
    { key: "awards", href: "award.html?v=" + version, label: "Awards" },
    { key: "task-forces", href: "task-force.html?v=" + version, label: "Task Force" }
  ];

  var pageMap = {
    about: { title: "Aim and Scope", render: renderAbout, showHeader: true },
    organization: { title: "Organization", render: renderOrganization, showHeader: false },
    officers: { title: "Officer", render: renderOfficers, showHeader: false },
    activities: {
      title: "Activities",
      render: renderActivities,
      showHeader: true,
      intro: "The complete list of technically sponsored activities are listed as follows:"
    },
    journals: { title: "Journals", render: renderJournals, showHeader: true },
    news: { title: "Hyper-Intelligence Related News", render: renderNews, showHeader: true },
    newsletters: { title: "NewsLetters List", render: renderNewsletters, showHeader: true },
    awards: { title: "Awards in our Technical Committee", render: renderAwards, showHeader: true },
    "task-forces": { title: "Task Force List", render: renderTaskForces, showHeader: true }
  };

  renderLoading();

  loadSiteData()
    .then(function (payload) {
      data = payload;
      renderApp();
      bindInteractions();
    })
    .catch(function (error) {
      console.error(error);
      app.innerHTML = '<div class="site-layout"><div class="content-shell"><main class="content-main"><p>Failed to load page data.</p></main></div></div>';
    });

  function renderLoading() {
    app.innerHTML = '<div class="site-layout"><div class="content-shell"><main class="content-main"><p>Loading...</p></main></div></div>';
  }

  function loadSiteData() {
    var dataFiles = {
      site: "site.json",
      about: "about.json",
      organization: "organization.json",
      officers: "officers.json",
      activities: "activities.json",
      journals: "journals.json",
      news: "news.json",
      newsletters: "newsletters.json",
      awards: "awards.json",
      awardsCall: "awards-call.json",
      taskForces: "task-forces.json"
    };

    return Promise.all(
      Object.keys(dataFiles).map(function (key) {
        var url = "data/" + dataFiles[key] + "?v=" + version;
        return fetch(url, { cache: "no-store" })
          .then(function (response) {
            if (!response.ok) {
              throw new Error("Failed to load " + url + " (" + response.status + ")");
            }
            return response.json();
          })
          .then(function (value) {
            return [key, value];
          });
      })
    ).then(function (entries) {
      var payload = {};

      entries.forEach(function (entry) {
        payload[entry[0]] = entry[1];
      });

      payload.site.generatedAt = new Date().toISOString();
      payload.featuredActivities = (payload.activities || []).filter(function (item) {
        return !!item.featured;
      });
      payload.stats = {
        activities: (payload.activities || []).length,
        journals: (payload.journals || []).length,
        taskForces: (payload.taskForces || []).length,
        members: (payload.organization || []).reduce(function (sum, group) {
          return sum + ((group && group.members) ? group.members.length : 0);
        }, 0)
      };

      return payload;
    });
  }

  function renderApp() {
    var page = pageMap[currentPage] || pageMap.about;

    app.innerHTML = [
      '<div class="site-layout">',
      renderSidebar(),
      '<div class="content-shell">',
      renderMobileBar(),
      '<main class="content-main">',
      renderTopLogo(),
      page.showHeader === false ? "" : renderPageTitle(resolvePageTitle(page), page.intro),
      '<section class="page-content">',
      page.render(),
      "</section>",
      "</main>",
      "</div>",
      "</div>"
    ].join("");
  }

  function resolvePageTitle(page) {
    if (currentPage === "about") {
      return data.about.title;
    }

    if (currentPage === "awards" && currentAward) {
      var award = findAward(currentAward);
      return award ? award.name : page.title;
    }

    return page.title;
  }

  function renderSidebar() {
    return [
      '<aside class="sidebar" id="sidebar">',
      '<div class="sidebar-inner">',
      '<nav class="sidebar-nav">',
      navigation.map(renderNavItem).join(""),
      "</nav>",
      '<div class="sidebar-logo">',
      data.site.logo ? '<img src="' + escapeAttr(data.site.logo) + '" alt="IEEE Systems Council">' : "",
      "</div>",
      "</div>",
      "</aside>"
    ].join("");
  }

  function renderNavItem(item) {
    if (item.key !== "awards") {
      var active = item.key === currentPage ? ' class="is-active"' : "";
      return '<a' + active + ' href="' + escapeAttr(item.href) + '">' + escapeHtml(item.label) + "</a>";
    }

    var onAwards = currentPage === "awards";
    var overviewActive = onAwards && !currentAward ? ' class="is-active"' : "";

    return [
      '<div class="sidebar-group' + (onAwards ? " is-open" : "") + '">',
      '<div class="sidebar-group-row">',
      '<a' + overviewActive + ' href="' + escapeAttr(item.href) + '">' + escapeHtml(item.label) + "</a>",
      '<button class="subnav-toggle" type="button" aria-expanded="' + (onAwards ? "true" : "false") + '" aria-controls="awards-subnav" aria-label="Toggle award list"></button>',
      "</div>",
      '<div class="sidebar-subnav" id="awards-subnav">',
      listAwards().map(function (award) {
        var subActive = onAwards && currentAward === award.slug ? ' class="is-active"' : "";
        return '<a' + subActive + ' href="' + escapeAttr(awardHref(award)) + '">' + escapeHtml(award.navLabel || award.name) + "</a>";
      }).join(""),
      "</div>",
      "</div>"
    ].join("");
  }

  function renderMobileBar() {
    return [
      '<div class="mobile-bar">',
      '<a class="mobile-brand" href="index.html?v=' + version + '">IEEE HITC</a>',
      '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="sidebar">Menu</button>',
      "</div>"
    ].join("");
  }

  function renderTopLogo() {
    return [
      '<div class="top-logo-wrap">',
      data.site.heroImage ? '<img class="top-logo" src="' + escapeAttr(data.site.heroImage) + '" alt="' + escapeAttr(data.site.name) + '">' : "",
      "</div>"
    ].join("");
  }

  function renderPageTitle(title, intro) {
    return [
      '<header class="page-header">',
      '<h1 class="page-title">' + escapeHtml(title) + "</h1>",
      intro ? '<p class="page-intro">' + escapeHtml(intro) + "</p>" : "",
      '<div class="page-divider"></div>',
      "</header>"
    ].join("");
  }

  function renderAbout() {
    return [
      '<h2 class="section-title section-title-dark">Aim and Scope</h2>',
      renderBlocks(data.about.blocks)
    ].join("");
  }

  function renderOrganization() {
    return data.organization.map(function (group) {
      return [
        '<section class="subsection">',
        '<h2 class="section-title">' + escapeHtml(group.name) + "</h2>",
        '<div class="section-divider"></div>',
        '<div class="member-grid">',
        group.members.map(renderMemberCard).join(""),
        "</div>",
        "</section>"
      ].join("");
    }).join("");
  }

  function renderMemberCard(member) {
    return [
      '<article class="member-item">',
      '<div class="member-photo">',
      member.avatar ? '<img src="' + escapeAttr(member.avatar) + '" alt="' + escapeAttr(member.name) + '">' : "",
      "</div>",
      '<div class="member-copy">',
      '<h3 class="member-name">',
      member.homepage ? '<a href="' + escapeAttr(member.homepage) + '" target="_blank" rel="noreferrer">' + escapeHtml(member.name) + "</a>" : escapeHtml(member.name),
      "</h3>",
      '<div class="member-meta">',
      member.workUnits.map(function (unit) { return "<div>" + escapeHtml(unit) + "</div>"; }).join(""),
      member.country ? "<div>" + escapeHtml(member.country) + "</div>" : "",
      "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function renderOfficers() {
    return data.officers.map(function (group) {
      return [
        '<section class="subsection">',
        '<h2 class="section-title">' + escapeHtml(group.name) + "</h2>",
        '<ul class="plain-list">',
        group.members.map(function (member) {
          return "<li>" + escapeHtml(member) + "</li>";
        }).join(""),
        "</ul>",
        "</section>"
      ].join("");
    }).join("");
  }

  function renderActivities() {
    return [
      '<div class="activity-list">',
      data.activities.map(function (item) {
        return [
          '<article class="activity-item">',
          '<div class="activity-logo">',
          item.image ? '<img src="' + escapeAttr(item.image) + '" alt="">' : "",
          "</div>",
          '<div class="activity-copy">',
          '<div class="activity-title">' + renderLinkedTitle(item.title, item.link) + "</div>",
          '<div class="activity-date">' + renderTextWithBreaks(item.date) + "</div>",
          "</div>",
          "</article>"
        ].join("");
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderJournals() {
    return data.journals.map(function (item) {
      return [
        '<article class="journal-item">',
        '<div class="journal-cover">',
        item.image ? '<img src="' + escapeAttr(item.image) + '" alt="' + escapeAttr(item.name) + '">' : "",
        "</div>",
        '<div class="journal-copy">',
        '<h2 class="journal-name">',
        item.link ? '<a href="' + escapeAttr(item.link) + '" target="_blank" rel="noreferrer">' + escapeHtml(item.name) + "</a>" : escapeHtml(item.name),
        "</h2>",
        item.issue ? '<div class="journal-issue">' + renderTextWithBreaks(item.issue) + "</div>" : "",
        renderBlocks(item.blocks),
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderNews() {
    return data.news.map(function (item) {
      return [
        '<article class="news-item">',
        '<div class="news-title">' + renderLinkedTitle(item.title, item.link) + "</div>",
        renderBlocks(item.blocks),
        "</article>"
      ].join("");
    }).join("");
  }

  function renderNewsletters() {
    return [
      '<ul class="newsletter-list">',
      data.newsletters.map(function (item) {
        return [
          "<li>",
          item.pdf
            ? '<a href="' + escapeAttr(item.pdf) + '" target="_blank" rel="noreferrer">' + escapeHtml(item.name) + "</a>"
            : escapeHtml(item.name),
          "</li>"
        ].join("");
      }).join(""),
      "</ul>"
    ].join("");
  }

  function listAwards() {
    return (data.awards || []).filter(function (item) {
      return item && item.name && item.slug;
    });
  }

  function findAward(slug) {
    var matches = listAwards().filter(function (item) {
      return item.slug === slug;
    });
    return matches.length ? matches[0] : null;
  }

  function awardHref(award) {
    return (award.page || "award-" + award.slug + ".html") + "?v=" + version;
  }

  function renderAwards() {
    if (currentAward) {
      return renderAwardDetail(findAward(currentAward));
    }
    return renderAwardsOverview();
  }

  function renderAwardsOverview() {
    var call = data.awardsCall || {};

    return [
      '<section class="subsection">',
      call.title ? '<h2 class="section-title">' + escapeHtml(call.title) + "</h2>" : "",
      renderBlocks(call.blocks || []),
      '<h3 class="content-subtitle">Award Categories:</h3>',
      '<div class="rich-text award-rich-text"><div class="award-items">',
      listAwards().map(function (award) {
        return [
          '<div class="award-item">',
          '<a href="' + escapeAttr(awardHref(award)) + '">' + escapeHtml(award.name) + "</a>",
          award.summary ? '<span class="award-summary">' + escapeHtml(award.summary) + "</span>" : "",
          "</div>"
        ].join("");
      }).join(""),
      "</div></div>",
      "</section>"
    ].join("");
  }

  function renderAwardDetail(award) {
    var backLink = '<p class="award-back"><a href="award.html?v=' + version + '">&larr; All Awards</a></p>';

    if (!award) {
      return backLink + '<div class="rich-text"><p>Award not found.</p></div>';
    }

    var blocks = award.blocks || [];
    var splitAt = -1;
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i] && blocks[i].type === "divider") {
        splitAt = i;
        break;
      }
    }

    var callBlocks = splitAt === -1 ? blocks : blocks.slice(0, splitAt);
    var winnerBlocks = splitAt === -1 ? [] : blocks.slice(splitAt + 1);
    var year = data.awardsCall && data.awardsCall.year ? " (" + escapeHtml(String(data.awardsCall.year)) + ")" : "";

    return [
      backLink,
      '<section class="subsection">',
      '<h2 class="section-title">Call for Nominations' + year + "</h2>",
      renderAwardBlocks(callBlocks),
      "</section>",
      winnerBlocks.length
        ? [
            '<section class="subsection">',
            '<h2 class="section-title">Past Winners</h2>',
            renderAwardBlocks(winnerBlocks),
            "</section>"
          ].join("")
        : ""
    ].join("");
  }

  function renderTaskForces() {
    return [
      data.taskForces.map(function (item) {
        return [
          '<section class="subsection">',
          '<h2 class="section-title">' + escapeHtml(item.name) + "</h2>",
          renderBlocks(item.blocks),
          "</section>"
        ].join("");
      }).join("")
    ].join("");
  }

  function renderBlocks(blocks) {
    return [
      '<div class="rich-text">',
      (blocks || []).map(renderBlock).join(""),
      "</div>"
    ].join("");
  }

  function renderAwardBlocks(blocks) {
    var html = ['<div class="rich-text award-rich-text">'];

    (blocks || []).forEach(function (block) {
      if (!block || !block.type) {
        return;
      }

      if (block.type === "divider") {
        html.push('<hr class="content-divider">');
        return;
      }

      if (block.type === "heading") {
        html.push('<h3 class="content-subtitle">' + escapeHtml(block.text || "") + "</h3>");
        return;
      }

      if (block.type === "list") {
        html.push(renderAwardItems(block.items || []));
        return;
      }

      if (block.type === "paragraph") {
        if (block.indent) {
          html.push(renderAwardItem(block.text || ""));
          return;
        }

        html.push("<p>" + renderTextWithBreaks(block.text || "") + "</p>");
      }
    });

    html.push("</div>");
    return html.join("");
  }

  function renderBlock(block) {
    if (!block || !block.type) {
      return "";
    }

    if (block.type === "divider") {
      return '<hr class="content-divider">';
    }

    if (block.type === "heading") {
      return '<h3 class="content-subtitle">' + escapeHtml(block.text || "") + "</h3>";
    }

    if (block.type === "list") {
      return [
        '<ul class="content-list">',
        (block.items || []).map(function (item) {
          return "<li>" + renderTextWithBreaks(item) + "</li>";
        }).join(""),
        "</ul>"
      ].join("");
    }

    if (block.type === "paragraph") {
      if (isLabelLine(block.text || "")) {
        return '<h3 class="content-subtitle">' + escapeHtml(block.text || "") + "</h3>";
      }
      return "<p>" + renderTextWithBreaks(block.text || "") + "</p>";
    }

    return "";
  }

  function renderLinkedTitle(title, link) {
    var safeTitle = escapeHtml(title || "");
    if (!link) {
      return safeTitle;
    }
    return '<a href="' + escapeAttr(link) + '" target="_blank" rel="noreferrer">' + safeTitle + "</a>";
  }

  function renderTextWithBreaks(text) {
    return escapeHtml(text || "").replace(/\n/g, "<br>");
  }

  function renderAwardItems(items) {
    return [
      '<div class="award-items">',
      items.map(function (item) {
        return renderAwardItem(item);
      }).join(""),
      "</div>"
    ].join("");
  }

  function renderAwardItem(text) {
    return '<div class="award-item">' + renderTextWithBreaks(text || "") + "</div>";
  }

  function isLabelLine(text) {
    var trimmed = String(text || "").trim();
    return trimmed.endsWith(":") && trimmed.length <= 40;
  }

  function bindInteractions() {
    var toggle = document.querySelector(".menu-toggle");
    var sidebar = document.getElementById("sidebar");

    if (toggle && sidebar) {
      toggle.addEventListener("click", function () {
        var open = sidebar.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var subnavToggle = document.querySelector(".subnav-toggle");
    var subnavGroup = subnavToggle ? subnavToggle.closest(".sidebar-group") : null;

    if (subnavToggle && subnavGroup) {
      subnavToggle.addEventListener("click", function (event) {
        event.preventDefault();
        var open = subnavGroup.classList.toggle("is-open");
        subnavToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }
})();
