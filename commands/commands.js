const usersData = [{
    "name":"Beebslaweez",
    "!relax":60,
    "!bingo":60,
    "!robert":30
},{
    "name":"BodeVocoder",
    "!relax":60
},{
    "name":"Deejennn",
    "!uppiesgasm":60
},{
    "name":"EphemerisFM",
    "!relax":60,
    "!uppiesgasm":60,
    "!bingo":60
},{
    "name":"grapenuts",
    "!relax":60
},{
    "name":"HyperStipherX",
    "!relax":60,
    "!bingo":60
},{
    "name":"Imperial_Sun",
    "!robert":30
},{
    "name":"ir0nthighs",
    "!relax":60,
    "!uppiesgasm":60,
    "!ugasm":0,
    "!robert":30,
    "!bingo":60
},{
    "name":"larryDave_id",
    "!relax":60
},{
    "name":"Luthimir",
    "!relax":60,
    "!uppiesgasm":60,
    "!bingo":30,
    "!robert":30
},{
    "name":"osfish",
    "!relax":60,
    "!uppiesgasm":60
},{
    "name":"PithyPeaches",
    "!kitty":60
},{
    "name":"RandomVoiceGuy",
    "!bingo":60
},{
    "name":"RemainNick",
    "!bingo":60
},{
    "name":"RoboSideCar",
    "!bingo":60
},{
    "name":"SutekhPrime",
    "!relax":60,
    "!uppiesgasm":60
},{
    "name":"Tyrandian",
    "!relax":60,
    "!robert":30
},{
    "name":"zimchuck",
    "!relax":60,
    "!bingo":60,
    "!robert":30
}];

const subscribersData = [{
    "months":3,
    "!skeletor":60,
    "!pizzle":60
},{
    "months":6,
    "!bobthink":60,
    "!bobnow":60,
    "!kitty":60
}];

const rolesData = [{
    "name":"Global",
    "!bruh":15,
    "!fool":15,
    "!heknew":15,
    "!rocks":15
},{
    "name":"Currently Subscribed",
    "!hello":60,
    "!goodbye":60,
    "!tryhard":60
},{
    "name":"VIP",
    "!square":60,
    "!lookatus":60
}];

const copyableData = {
    "name":"Copyable commands",
    "!relax":60,
    "!uppiesgasm":60,
    "!bingo":60,
    "!robert":30
}
  null;

// ── Everything below this line runs automatically ─────────────

let rolesLoaded = [];
let globalRole  = null;

function init() {
  if (!copyableData && rolesData.length === 0 && usersData.length === 0 && subscribersData.length === 0) {
    document.getElementById('results').innerHTML =
      `<div class="placeholder-card" style="color:var(--red)">
        No data loaded. Open commands.js and paste your JSON data into the variables at the top of the file.
      </div>`;
    return;
  }

  globalRole  = rolesData.find(r => r.name === 'Global') || null;
  rolesLoaded = rolesData.filter(r => r.name !== 'Global');

  buildCheckboxes();
  render();
}

// ── Build role + copyable checkboxes ──────────────────────────
function buildCheckboxes() {
  const container = document.getElementById('roleCheckboxes');
  container.innerHTML = '';

  rolesLoaded.forEach(role => {
    container.appendChild(makeCheckbox(`role_${role.name}`, role.name));
  });

  if (copyableData) {
    const label = copyableData.name || 'Copyable Commands';
    container.appendChild(makeCheckbox('copyable', label));
  }
}

function makeCheckbox(id, labelText) {
  const lbl = document.createElement('label');
  lbl.className = 'check-label';
  lbl.htmlFor = id;

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.id   = id;
  cb.addEventListener('change', () => {
    lbl.classList.toggle('active', cb.checked);
    render();
  });

  lbl.appendChild(cb);
  lbl.appendChild(document.createTextNode(labelText));
  return lbl;
}

// ── Extract commands from a data object (skip "name"/"months") ─
function getCommands(obj) {
  return Object.entries(obj)
    .filter(([k]) => k !== 'name' && k !== 'months')
    .map(([cmd, cd]) => ({ cmd, cooldown: cd }));
}

// ── Render results ─────────────────────────────────────────────
function render() {
  const nameVal   = document.getElementById('nameInput').value.trim().toLowerCase();
  const monthsVal = parseInt(document.getElementById('monthsInput').value, 10);

  const sections = [];

  // 1. Global — always first
  if (globalRole) {
    sections.push({
      title: 'Global',
      badge: null,
      note:  'All global commands have shared cooldowns.',
      cmds:  getCommands(globalRole),
      style: 'normal',
    });
  }

  // 2. User-specific commands
  if (nameVal.length > 0) {
    const user = usersData.find(u => u.name && u.name.toLowerCase() === nameVal);
    const cmds = user ? getCommands(user) : [];
    sections.push({
      title: `User: ${nameVal}`,
      badge: null,
      note:  null,
      cmds,
      empty: 'User not found or user has no unique commands.',
      style: 'normal',
    });
  }

  // 3. Subscriber commands
  if (!isNaN(monthsVal) && monthsVal > 0) {
    const eligible = subscribersData.filter(s => typeof s.months === 'number' && s.months <= monthsVal);
    const allCmds  = eligible.flatMap(getCommands);
    const cmdMap   = {};
    allCmds.forEach(({ cmd, cooldown }) => {
      if (!cmdMap[cmd] || cooldown > cmdMap[cmd]) cmdMap[cmd] = cooldown;
    });
    const cmds = Object.entries(cmdMap).map(([cmd, cooldown]) => ({ cmd, cooldown }));

    sections.push({
      title: `Subscriber — ${monthsVal} month${monthsVal !== 1 ? 's' : ''}`,
      badge: null,
      note:  null,
      cmds,
      empty: 'No subscriber commands unlocked at this milestone.',
      style: 'normal',
    });
  }

  // 4. Role checkboxes
  rolesLoaded.forEach(role => {
    const cb = document.getElementById(`role_${role.name}`);
    if (cb && cb.checked) {
      sections.push({
        title: role.name,
        badge: 'Role',
        note:  null,
        cmds:  getCommands(role),
        style: 'normal',
      });
    }
  });

  // 5. Copyable commands — non-dupes shown in red
  const copyCb = document.getElementById('copyable');
  if (copyCb && copyCb.checked && copyableData) {
    const userObj  = usersData.find(u => u.name && u.name.toLowerCase() === nameVal);
    const userCmds = new Set(userObj ? getCommands(userObj).map(c => c.cmd) : []);

    const filtered = getCommands(copyableData)
      .filter(({ cmd }) => !userCmds.has(cmd));

    sections.push({
      title: copyableData.name || 'Copyable Commands',
      badge: null,
      note:  null,
      cmds:  filtered,
      style: 'copyable',
      empty: 'No unique copyable commands (all are already listed above).',
    });
  }

  // ── Build output HTML ─────────────────────────────────────────
  const resultsEl = document.getElementById('results');

  if (sections.length === 0) {
    resultsEl.innerHTML = '<div class="placeholder-card">Enter your details above to see your commands.</div>';
    return;
  }

  resultsEl.innerHTML = sections.map(sec => {
    const badgeHTML = sec.badge ? `<span class="section-badge">${sec.badge}</span>` : '';
    const noteHTML  = sec.note  ? `<div class="result-note">${sec.note}</div>` : '';

    let bodyHTML;
    if (sec.cmds.length === 0) {
      bodyHTML = `<div class="empty-note">${sec.empty || 'No commands.'}</div>`;
    } else {
      const items = sec.cmds.map(({ cmd, cooldown }) => {
        const isRed    = sec.style === 'copyable';
        const cmdClass = isRed ? 'cmd red' : 'cmd';
        return `<li>
          <span class="${cmdClass}">${cmd}</span>
          <span class="cooldown">— cooldown of ${cooldown} minute${cooldown !== 1 ? 's' : ''}</span>
        </li>`;
      }).join('');
      bodyHTML = `<ul class="command-list">${items}</ul>`;
    }

    return `
      <div class="result-section">
        <div class="result-section-header">${sec.title}${badgeHTML}</div>
        ${noteHTML}
        ${bodyHTML}
      </div>`;
  }).join('');
}

// ── Live update on input ──────────────────────────────────────
document.getElementById('nameInput').addEventListener('input', render);
document.getElementById('monthsInput').addEventListener('input', render);

init();
