/* Canon List renderer for JCink. */
(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  // JCink parses [user] BBCode only when a post is saved. Because this
  // directory is rendered after page load, convert those tags to normal
  // profile links ourselves.
  function forumText(value) {
    var source = String(value == null ? '' : value);
    var re = /\[user=(\d+)(?:,\d+)?\]([\s\S]*?)\[\/user\]/gi;
    var result = '';
    var last = 0;
    var match;

    while ((match = re.exec(source)) !== null) {
      result += escapeHtml(source.slice(last, match.index));
      result += '<a href="index.php?showuser=' + encodeURIComponent(match[1]) + '">' +
        escapeHtml(match[2]) + '</a>';
      last = re.lastIndex;
    }

    result += escapeHtml(source.slice(last));
    return result;
  }

  function renderAffiliation(item, data) {
    var meta;
    if (typeof item === 'string') {
      meta = data.affiliations[item];
    } else {
      meta = item;
    }
    if (!meta || !meta.src) return '';
    return '<img src="' + escapeAttr(meta.src) + '" alt="' + escapeAttr(meta.alt || '') + '">';
  }

  function renderCard(card, data) {
    var classes = ['canonCard'].concat(card.classes || []).join(' ');
    var portraitClasses = card.portraitClasses || ['canonPortrait', 'canonPortraitEmpty'];
    var portraitStyle = card.portrait
      ? ' style="--portrait:url(\'' + escapeAttr(card.portrait).replace(/'/g, '&#039;') + '\');"'
      : '';

    var affiliations = (card.affiliations || []).map(function (item) {
      return renderAffiliation(item, data);
    }).join('');

    var footerClasses = (card.footerClasses || ['canonPlayedBy']).join(' ');
    var footerTitle = card.footerTitle
      ? ' title="' + escapeAttr(card.footerTitle) + '"'
      : '';

    return '' +
      '<article class="' + escapeAttr(classes) + '">' +
        '<div class="canonPortraitWrap">' +
          '<div class="' + escapeAttr(portraitClasses.join(' ')) + '"' + portraitStyle + '></div>' +
        '</div>' +
        '<div class="canonMain">' +
          '<div class="canonName">' + forumText(card.name) + '</div>' +
          '<div class="canonInfo">' + escapeHtml(card.info) + '</div>' +
          (card.deceasedLabel
            ? '<div class="canonCauseOfDeath">' + escapeHtml(card.deceasedLabel) + '</div>'
            : '') +
          '<div class="canonAffiliations">' + affiliations + '</div>' +
        '</div>' +
        '<div class="canonFooter">' +
          '<div class="' + escapeAttr(footerClasses) + '"' + footerTitle + '>' + forumText(card.footer) + '</div>' +
        '</div>' +
      '</article>';
  }

  function renderBranch(branch, data) {
    var parents = (branch.parents || []).map(function (card) {
      return '<div class="canonTreeNode canonParent">' + renderCard(card, data) + '</div>';
    }).join('');

    var children = (branch.children || []).map(function (card, index) {
      var side = card.side || (index % 2 ? 'right' : 'left');
      return '<div class="canonTreeNode canonChild ' + escapeAttr(side) + '">' + renderCard(card, data) + '</div>';
    }).join('');

    return '' +
      '<div class="canonTreeBranch">' +
        '<div class="canonCoupleRow ">' + parents + '</div>' +
        '<div class="canonDescender"></div>' +
        '<div class="canonChildrenTree">' + children + '</div>' +
      '</div>';
  }

  function renderFamily(family, data) {
    return '' +
      '<section class="canonFamily">' +
        '<div class="canonFamilyTitle">' +
          '<img class="canonFamilySide canonFamilySideLeft" src="' + escapeAttr(data.familySideImage) + '" alt="">' +
          '<div class="canonFamilyName"><span class="canonFamilySurname">' + escapeHtml(family.surname) + '</span> <span class="canonFamilyWord">Family</span></div>' +
          '<img class="canonFamilySide canonFamilySideRight" src="' + escapeAttr(data.familySideImage) + '" alt="">' +
        '</div>' +
        (family.branches || []).map(function (branch) { return renderBranch(branch, data); }).join('') +
      '</section>';
  }

  function applyCanonUsergroupColors(root) {
    (root || document).querySelectorAll('.canonCard:not(.canonDeceased)').forEach(function(card) {
      var hasGroupClass = Array.prototype.some.call(card.classList, function(className) {
        return className.indexOf('group-') === 0;
      });
      if (hasGroupClass) return;
      if (card.style.getPropertyValue('--group')) return;

      var name = card.querySelector('.canonName');
      if (!name) return;
      var candidate = name.querySelector('a, .mention, .user-link, span[style*="color"]');
      if (!candidate) return;
      var color = window.getComputedStyle(candidate).color;
      if (color && color !== 'rgba(0, 0, 0, 0)') {
        card.style.setProperty('--group', color);
      }
    });
  }

  function render(target, data) {
    if (!target) throw new Error('Canon List target container was not found.');
    if (!data || !Array.isArray(data.families)) throw new Error('Canon List data was not loaded.');

    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var byLetter = {};
    letters.forEach(function (letter) { byLetter[letter] = []; });
    data.families.forEach(function (family) {
      var letter = (family.letter || family.surname.charAt(0) || '').toUpperCase();
      if (!byLetter[letter]) byLetter[letter] = [];
      byLetter[letter].push(family);
    });

    var legendHtml = (data.legend || []).map(function (item) {
      return '<div class="canonLegendItem"><img src="' + escapeAttr(item.src) + '" alt="' + escapeAttr(item.alt || item.label || '') + '"><span>' + escapeHtml(item.label) + '</span></div>';
    }).join('');

    var inputsHtml = letters.map(function (letter, index) {
      return '<input class="canonTabInput" type="radio" name="canonAZTabs" id="canonTab-' + letter + '"' + (index === 0 ? ' checked' : '') + '>';
    }).join('');

    var tabsHtml = letters.map(function (letter) {
      return '<label for="canonTab-' + letter + '">' + letter + '</label>';
    }).join('');

    var panelsHtml = letters.map(function (letter) {
      var list = byLetter[letter] || [];
      var content = list.length
        ? list.map(function (family) { return renderFamily(family, data); }).join('')
        : '<div class="canonEmpty">No ' + letter + ' families listed.</div>';
      return '<div class="canonPanel panel-' + letter + '">' + content + '</div>';
    }).join('');

    target.innerHTML = '' +
      '<div class="canonDirectory">' +
        '<img class="canonHeaderImage" src="' + escapeAttr(data.headerImage || '') + '" alt="Canon List">' +
        '<div class="canonLegend">' + legendHtml + '</div>' +
        inputsHtml +
        '<div class="canonAZTabs">' + tabsHtml + '</div>' +
        '<div class="canonPanels">' + panelsHtml + '</div>' +
        '<div class="canonDirectoryFooter"><img src="' + escapeAttr(data.footerImage || '') + '" alt=""></div>' +
      '</div>';

    applyCanonUsergroupColors(target);
    setTimeout(function () { applyCanonUsergroupColors(target); }, 350);
    setTimeout(function () { applyCanonUsergroupColors(target); }, 1000);
  }

  window.CanonDirectory = {
    render: render,
    applyCanonUsergroupColors: applyCanonUsergroupColors
  };

  var target = document.getElementById('canon-directory');
  if (target && window.CanonDirectoryData) {
    render(target, window.CanonDirectoryData);
  }
})();
