(function () {
  'use strict';

  const data = window.CONFERENCE_DATA;
  const app = document.getElementById('app');
  if (!data || !app) return;

  const esc = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const external = 'target="_blank" rel="noreferrer noopener"';
  const initials = (name) => String(name)
    .split(/\s+/)
    .filter((word) => /[A-Za-z\u00C0-\u024F]/.test(word[0] || ''))
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
  const chairSlides = [
    { id: 'chairs-general-program', label: 'General & Program Chairs', groups: data.chairGroups.slice(0, 2) },
    { id: 'chairs-vice-workshop', label: 'Vice-Chairs & Workshop Chairs', groups: data.chairGroups.slice(2, 3).concat(data.chairGroups.slice(4, 5)) },
    { id: 'chairs-steering', label: 'Steering Committee', groups: data.chairGroups.slice(8, 9) },
  ];
  const slides = [
    ['top', 'Overview'], ['about', 'Why ISPA'], ['dates', 'Dates'], ['tracks', 'Tracks'],
    ...chairSlides.map((group) => [group.id, group.label]),
    ['submission', 'Submit'], ['support', 'Connect'],
  ];

  const action = (label, href, tone = 'light', cue = '→') => `
    <a class="share-action share-action--${tone}" href="${esc(href)}" ${external}>${esc(label)} <span aria-hidden="true">${esc(cue)}</span></a>`;

  function introSlide() {
    return `
      <section class="share-slide share-slide--hero" id="top" aria-labelledby="hero-title">
        <div class="share-city" aria-hidden="true"><img src="assets/kuala-lumpur-petronas.jpg" alt=""></div>
        <div class="share-content share-hero-content">
          <h1 id="hero-title">IEEE<br><span>ISPA</span> 2026</h1>
          <p class="share-hero-name">The 24th IEEE International Symposium<br>on Parallel and Distributed Processing<br>with Applications</p>
          <div class="share-hero-meta"><span>${esc(data.meta.dateShort)}</span><span>${esc(data.meta.city)}, ${esc(data.meta.country)}</span></div>
          <p class="share-swipe-hint">Swipe up to explore <span aria-hidden="true">↓</span></p>
        </div>
      </section>`;
  }

  function aboutSlide() {
    return `
      <section class="share-slide share-slide--paper" id="about" aria-labelledby="about-title">
        <div class="share-content share-center-content">
          <p class="share-kicker"> </p>
          <h2 id="about-title">Introduction</h2>
          <p class="share-lead">${esc(data.meta.introduction)}</p>
          <div class="share-stats" aria-label="Conference highlights">
            <div><strong>24<sup>th</sup></strong><span>edition</span></div>
            <div><strong>${esc(data.meta.since)}</strong><span>since</span></div>
            <div><strong>IEEE</strong><span>Xplore &amp; EI</span></div>
          </div>
        </div>
      </section>`;
  }

  function datesSlide() {
    const splitYear = (label) => {
      const match = String(label).match(/^(.*?)\s*(\d{4})$/);
      return match ? { when: match[1], year: match[2] } : { when: label, year: '' };
    };
    return `
      <section class="share-slide share-slide--blue" id="dates" aria-labelledby="dates-title">
        <div class="share-content">
          <p class="share-kicker"></p>
          <h2 id="dates-title">Important Dates</h2>
          <div class="share-dates">
            ${data.deadlines.map((item) => {
              const { when, year } = splitYear(item.dateLabel);
              return `<div class="share-date ${item.tone === 'primary' ? 'is-primary' : ''}"><time>${esc(when)}${year ? `<span class="share-date-year">${esc(year)}</span>` : ''}</time><span>${esc(item.title)}</span></div>`;
            }).join('')}
          </div>
        </div>
      </section>`;
  }

  function tracksSlide() {
    return `
      <section class="share-slide share-slide--ink" id="tracks" aria-labelledby="tracks-title">
        <div class="share-content share-tracks-content">
          <p class="share-kicker">CALL FOR PAPERS</p>
          <h2 id="tracks-title">Tracks and topics</h2>
          <div class="share-tracks-overview" data-tracks-overview>
            ${data.tracks.map((track, index) => `
              <div class="share-track-item">
                <button type="button" class="share-track-card" data-track-index="${index}" aria-expanded="false" aria-controls="track-topics-${index}">
                  <span class="share-track-no">${esc(track.number)}</span>
                  <h3>${esc(track.title)}</h3>
                  <p>${esc(track.summary)}</p>
                  <span class="share-track-open"><span data-track-open-text>View topics</span> <span aria-hidden="true">+</span></span>
                </button>
                <div class="share-track-topics" id="track-topics-${index}" data-track-topics hidden>
                  <ul class="share-topic-list">${track.topics.map((topic) => `<li>${esc(topic)}</li>`).join('')}</ul>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </section>`;
  }

  function chairCard(chair) {
    const portrait = chair.photo
      ? `<img class="share-chair-photo${chair.photoFit === 'contain' ? ' share-chair-photo--contain' : ''}" src="${esc(chair.photo)}" alt="Portrait of ${esc(chair.name)}" loading="lazy">`
      : `<div class="share-chair-photo share-chair-photo--placeholder" aria-hidden="true">${esc(initials(chair.name))}</div>`;
    const place = [chair.institution, chair.country].filter(Boolean).map(esc).join(', ');
    return `<article class="share-chair-card">${portrait}<h3>${esc(chair.name)}</h3><p class="share-chair-place">${place}</p></article>`;
  }

  function chairSlide(group, index) {
    return `
      <section class="share-slide share-slide--chairs share-chair-slide" id="${esc(group.id)}" aria-label="Organizing committee — ${esc(group.label)}">
        <div class="share-content share-chairs-content">
          <div class="share-chairs-heading"><p class="share-kicker">ORGANIZING COMMITTEE · ${String(index + 1).padStart(2, '0')} / ${String(chairSlides.length).padStart(2, '0')}</p></div>
          <div class="share-chair-groups">
            ${group.groups.map((category) => `<section class="share-chair-category" aria-label="${esc(category.label)}"><h3 class="share-chair-type">${esc(category.label)}</h3><div class="share-chair-grid share-chair-grid--${category.members.length}">${category.members.map(chairCard).join('')}</div></section>`).join('')}
          </div>
        </div>
      </section>`;
  }

  function submissionSlide() {
    const issues = data.specialIssues.map((issue) => `<li><a href="${esc(issue.url)}" target="_blank" rel="noopener">${esc(issue.journal)}</a></li>`).join('');
    const [publicationNote, specialIssueNote] = data.submission.publication;
    return `
      <section class="share-slide share-slide--signal" id="submission" aria-label="Paper submission">
        <div class="share-content share-center-content share-submission-content">
          <section class="share-submission-module share-submission-module--submission" aria-labelledby="submission-module-title">
            <h2 class="share-submission-module-title" id="submission-module-title">Submission</h2>
            <div class="share-submission-facts">
              <div><strong>${esc(data.submission.review)}</strong><span>review model</span></div>
              <div class="share-submission-page-info">
                <p class="share-page-allowance"><strong>8+2</strong><span>Maximum 10 Pages</span></p>
                <b>or</b>
                <p class="share-page-allowance"><strong>6+2</strong><span>Maximum 8 Pages</span></p>
              </div>
            </div>
            <div class="share-submission-action">${action('Submit via EDAS', data.meta.edasUrl, 'dark')}</div>
          </section>
          <section class="share-submission-module share-submission-module--publication" aria-labelledby="publication-module-title">
            <h2 class="share-submission-module-title" id="publication-module-title">Publication</h2>
            <div class="share-publication">
              <p>${esc(publicationNote)}</p>
            </div>
          </section>
          <section class="share-submission-module share-submission-module--issues" aria-labelledby="issues-module-title">
            <h2 class="share-submission-module-title" id="issues-module-title">Special Issues</h2>
            <p class="share-special-issues-note">${esc(specialIssueNote)}</p>
            <ul class="share-special-issues">${issues}</ul>
          </section>
        </div>
      </section>`;
  }

  function supportSlide() {
    return `
      <section class="share-slide share-slide--final" id="support" aria-labelledby="support-title">
        <div class="share-content share-final-content">
          <div class="share-final-primary">
            <h2 id="support-title">Welcome to <em>IEEE ISPA 2026!</em></h2>
            <div class="share-actions">${action('Official website', data.meta.officialUrl, 'final', '☞')}${action('Submit via EDAS', data.meta.edasUrl, 'final', '☞')}</div>
          </div>
          <div class="share-final-partners">
            <p class="share-support-label">SPONSORS</p>
            <div class="share-logo-wrap share-logo-wrap--sponsors" aria-label="Sponsors and supporters">
              ${data.sponsors.map(({ name, logo }) => `<div><img src="${esc(logo)}" alt="${esc(name)} logo" loading="lazy"></div>`).join('')}
            </div>
            <p class="share-support-label">Organizers</p>
            <div class="share-logo-wrap share-logo-wrap--organizers" aria-label="Organizers">
              ${data.organizers.map(({ name, logo }) => `<div><img src="${esc(logo)}" alt="${esc(name)} logo" loading="lazy"></div>`).join('')}
            </div>
          </div>
          <div class="share-final-footer">
            <p class="share-final-date">27–30 December 2026</p>
            <p class="share-final-location">Kuala Lumpur, Malaysia</p>
            <img class="share-qr-code" src="assets/QR_Code.png" alt="ISPA 2026 QR code" loading="lazy">
          </div>
        </div>
      </section>`;
  }

  app.innerHTML = `
    <main class="share-deck" id="main" data-active-slide="top" tabindex="0" aria-label="IEEE ISPA 2026 share deck">
      ${introSlide()}${aboutSlide()}${datesSlide()}${tracksSlide()}${chairSlides.map(chairSlide).join('')}${submissionSlide()}${supportSlide()}
    </main>
    <button class="share-audio-toggle" type="button" data-audio-toggle aria-label="Mute background music" aria-pressed="true" title="Mute background music"><span aria-hidden="true">♫</span></button>
    <audio data-background-music src="assets/music.mp3" loop preload="auto"></audio>
    <nav class="share-progress" aria-label="Share deck sections">
      ${slides.map(([id, label], index) => `<button type="button" data-slide-target="${id}" aria-label="Go to ${label}" aria-current="${index === 0 ? 'step' : 'false'}"><span>${String(index + 1).padStart(2, '0')}</span></button>`).join('')}
    </nav>`;

  const deck = document.querySelector('.share-deck');
  const slideElements = [...deck.querySelectorAll('.share-slide')];
  const progressButtons = [...document.querySelectorAll('[data-slide-target]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const audioToggle = document.querySelector('[data-audio-toggle]');
  const backgroundMusic = document.querySelector('[data-background-music]');
  let activeIndex = 0;
  let scrollFrame = 0;

  backgroundMusic.volume = 0.08;

  function activate(index, shouldScroll) {
    activeIndex = Math.max(0, Math.min(index, slideElements.length - 1));
    const activeSlide = slideElements[activeIndex];
    deck.dataset.activeSlide = activeSlide.id;
    progressButtons.forEach((button, buttonIndex) => button.setAttribute('aria-current', buttonIndex === activeIndex ? 'step' : 'false'));
    if (shouldScroll) activeSlide.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  progressButtons.forEach((button, index) => button.addEventListener('click', () => activate(index, true)));
  deck.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const midpoint = deck.scrollTop + deck.clientHeight / 2;
      const nextIndex = slideElements.findIndex((slide, index) => {
        const next = slideElements[index + 1];
        return !next || midpoint < next.offsetTop;
      });
      if (nextIndex !== -1 && nextIndex !== activeIndex) activate(nextIndex, false);
    });
  }, { passive: true });
  deck.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(event.key)) return;
    event.preventDefault();
    activate(activeIndex + (['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1), true);
  });

  function setMusicState(playing) {
    audioToggle.setAttribute('aria-pressed', String(playing));
    audioToggle.setAttribute('aria-label', playing ? 'Mute background music' : 'Play background music');
    audioToggle.title = playing ? 'Mute background music' : 'Play background music';
  }

  // 浏览器自动播放策略：先用静音方式启动播放（muted autoplay 总是被允许），
  // 用户产生任意交互（点击/触屏/按键/滚轮）后取消静音真正出声
  let unlocked = false;
  const detachUnlock = () => {
    ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach((type) => window.removeEventListener(type, unlock));
  };
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    backgroundMusic.muted = false;
    if (backgroundMusic.paused) {
      backgroundMusic.play().then(() => setMusicState(true)).catch(() => {});
    }
    detachUnlock();
  };
  ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach((type) => window.addEventListener(type, unlock, { passive: true }));

  // 一进入即为开启状态：静音自动播放，首个交互后出声
  backgroundMusic.muted = true;
  setMusicState(true);
  backgroundMusic.play().then(() => {
    setMusicState(true);
  }).catch(() => setMusicState(false));

  audioToggle.addEventListener('click', () => {
    unlocked = true;
    detachUnlock();
    backgroundMusic.muted = false;
    if (backgroundMusic.paused) {
      backgroundMusic.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
    } else {
      backgroundMusic.pause();
      setMusicState(false);
    }
  });

  // Track 卡片 → 在卡片内部下方展开/收起 topics（互斥手风琴）
  const overview = document.querySelector('[data-tracks-overview]');
  const trackCards = [...document.querySelectorAll('[data-track-index]')];
  let openTrackIndex = -1;

  function setOpenCard(index) {
    openTrackIndex = index;
    trackCards.forEach((card, cardIndex) => {
      const open = cardIndex === index;
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
      card.parentElement.querySelector('[data-track-topics]').hidden = !open;
      const openText = card.querySelector('[data-track-open-text]');
      if (openText) openText.textContent = open ? 'Hide topics' : 'View topics';
    });
  }

  if (overview && trackCards.length) {
    trackCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        setOpenCard(openTrackIndex === index ? -1 : index);
      });
    });
  }
})();
